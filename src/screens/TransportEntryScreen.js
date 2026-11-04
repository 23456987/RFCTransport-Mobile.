import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import styles from '../AppStyles';
import {
  getUserDates, getVehicles, getPlaces, getRouteCounts, postTransportEntry, getStoredUser
} from '../api/api';

export default function TransportEntryScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [userObj, setUserObj] = useState(null);

  const [dates, setDates] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [places, setPlaces] = useState([]);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedPlace, setSelectedPlace] = useState('');

  const [tripsRequired, setTripsRequired] = useState('');
  const [remainingTravellers, setRemainingTravellers] = useState('');

  const [occupancy, setOccupancy] = useState(false);
  const [currentTime, setCurrentTime] = useState((new Date()).toLocaleTimeString());
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    (async () => {
      const u = await getStoredUser();
      setUserObj(u);
      await loadInitial(u);
      setLoading(false);
      // current time tick
      const t = setInterval(() => setCurrentTime((new Date()).toLocaleTimeString()), 1000);
      return () => clearInterval(t);
    })();
  }, []);

  async function loadInitial(u) {
    try {
      const userId = u?.trans_user_id ?? u?.user_id ?? u?.id ?? null;
      // 1 - get dates
      if (userId) {
        const d = await getUserDates(userId);
        setDates(d?.data ?? []);
      }
      // 2 - vehicles
      const v = await getVehicles();
      setVehicles(v?.data ?? []);

      // 3 - places
      const p = await getPlaces();
      setPlaces(p?.data ?? []);
    } catch (err) {
      console.error('init err', err);
      Alert.alert('Error', 'Unable to fetch initial data');
    }
  }

  async function onPlaceSelect(place) {
    setSelectedPlace(place.route_id ?? place.id ?? place);
    // fetch counts
    try {
      const r = await getRouteCounts(place.route_id ?? place.id ?? place);
      const payload = r?.data ?? {};
      setTripsRequired(payload.trips_required ?? payload.required_trips ?? '');
      setRemainingTravellers(payload.remaining_travellers ?? payload.remaining ?? '');
    } catch (err) {
      console.warn('count err', err);
    }
  }

  async function onSubmit() {
    if (!selectedDate) return Alert.alert('Validation', 'Select date');
    if (!selectedPlace) return Alert.alert('Validation', 'Select place/route');

    const userId = userObj?.trans_user_id ?? userObj?.user_id ?? userObj?.id;
    if (!userId) return Alert.alert('Error', 'Logged user id missing');

    const payload = {
      trans_user_id: userId,
      timing: selectedTime || currentTime,
      vehicle: selectedVehicle,
      occupancy: occupancy ? 1 : 0,
      trans_route_id: selectedPlace,
      date: selectedDate,
      trips_required: tripsRequired,
      remaining_travellers: remainingTravellers
    };

    try {
      const res = await postTransportEntry(payload);
      const data = res?.data ?? {};
      if (data?.success || data?.status === 'success' || data?.msg === 'Success') {
        Alert.alert('Success', data?.message ?? 'Transport entry saved');
        // Reset some fields
        setSelectedVehicle('');
        setSelectedTime('');
      } else {
        Alert.alert('Failed', data?.message ?? 'Could not save entry');
      }
    } catch (err) {
      console.error('post err', err);
      Alert.alert('Error', 'Unable to save entry');
    }
  }

  if (loading) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>RFCTransport</Text></View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={{ color: '#b33d3d', fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Transportation Entry</Text>

        <Text style={{ marginBottom: 6 }}>Select User</Text>
        <TextInput style={styles.input} editable={false} value={(userObj?.name ?? userObj?.username) || ''} />

        <Text style={{ marginTop: 6 }}>Select Date</Text>
        {/* simple select: show horizontal buttons */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
          {dates.map((d, i) => {
            // date might be string or object
            const label = (typeof d === 'string' ? d : (d.date || d.trans_date || JSON.stringify(d)));
            return (
              <TouchableOpacity key={i} onPress={() => setSelectedDate(label)} style={{
                padding: 10, marginRight: 8, borderWidth: 1, borderColor: selectedDate === label ? '#2aa76e' : '#c94d49', borderRadius: 8
              }}>
                <Text>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#b33d3d' }}>Trips Required</Text>
            <TextInput style={styles.input} value={tripsRequired?.toString()} onChangeText={setTripsRequired} keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#b33d3d' }}>Remaining Travellers</Text>
            <TextInput style={styles.input} value={remainingTravellers?.toString()} onChangeText={setRemainingTravellers} keyboardType="numeric" />
          </View>
        </View>

        <Text style={{ marginTop: 12 }}>Search Vehicle</Text>
        <TextInput style={styles.input} placeholder="Type or pick vehicle" value={selectedVehicle} onChangeText={setSelectedVehicle} />

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <Text style={{ marginRight: 12 }}>Occupancy</Text>
          <TouchableOpacity onPress={() => setOccupancy(p => !p)} style={{
            width: 36, height: 36, borderWidth: 1, borderRadius: 8, borderColor: occupancy ? '#2aa76e' : '#c94d49', alignItems: 'center', justifyContent: 'center',
            backgroundColor: occupancy ? '#2aa76e' : '#fff'
          }}>
            <Text style={{ color: occupancy ? '#fff' : '#333' }}>{occupancy ? '✓' : ''}</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ marginTop: 12 }}>Select Point</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
          {places.map((p, idx) => {
            const label = p.route_name ?? p.place_name ?? p.name ?? JSON.stringify(p);
            const id = p.route_id ?? p.id ?? p.place_id;
            return (
              <TouchableOpacity key={idx} onPress={() => onPlaceSelect(p)} style={{
                padding: 10, marginRight: 8, borderWidth: 1, borderColor: selectedPlace === id ? '#2aa76e' : '#c94d49', borderRadius: 8
              }}>
                <Text>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 }}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: '#b33d3d' }}>Current Time</Text>
            <Text style={{ marginTop: 8 }}>{currentTime}</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: '#b33d3d' }}>Selected Time</Text>
            <TextInput style={styles.input} placeholder="Tap to enter time" value={selectedTime} onChangeText={setSelectedTime} />
            <Text style={{ fontSize: 12, color: '#777' }}>Or leave blank to use current time</Text>
          </View>
        </View>

        <TouchableOpacity style={{ marginTop: 22, backgroundColor: '#6fbf3a', paddingVertical: 12, borderRadius: 12, alignItems: 'center' }} onPress={onSubmit}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>SUBMIT</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
