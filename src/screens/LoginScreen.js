import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../AppStyles';
import { loginRequest } from '../api/api';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onLogin() {
    if (!username || !password) return Alert.alert('Validation', 'Please enter username and password');

    try {
      setLoading(true);
      const res = await loginRequest(username, password);
      // NOTE: adapt parsing to your actual login response structure
      // Assuming res.data has { success: true, data: { trans_user_id, user_id, ... } }
      const data = res?.data;
      if (data?.success || data?.status === 'success') {
        // store response object so other screens can read trans_user_id
        await AsyncStorage.setItem('userData', JSON.stringify(data.data ?? data.user ?? data));
        navigation.reset({ index: 0, routes: [{ name: 'TransportEntry' }] });
      } else {
        Alert.alert('Login failed', data?.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('login error', err?.message || err);
      Alert.alert('Error', 'Unable to login. Check server or credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>RFCTransport</Text></View>

      <View style={styles.content}>
        <Text style={{ textAlign: 'center', marginBottom: 12, color: '#b33d3d', fontWeight: '700' }}> </Text>

        {/* optionally include logo */}
        <View style={{ alignItems: 'center', marginBottom: 18 }}>
          {/* If you have a logo file, use <Image source={require('../assets/logo.png')} /> */}
        </View>

        <TextInput placeholder="Enter User Name" style={styles.input} value={username} onChangeText={setUsername} />
        <TextInput placeholder="Password" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />

        <TouchableOpacity style={styles.bigButton} onPress={onLogin} disabled={loading}>
          <Text style={styles.bigButtonText}>{loading ? 'Please wait...' : 'LOGIN'}</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 }}>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}><Text style={{ color: '#b33d3d' }}>Forgot Password !</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}><Text style={{ color: '#b33d3d' }}>New Here ?</Text></TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
