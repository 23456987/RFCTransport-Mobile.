import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import styles from '../AppStyles';
import { registerRequest } from '../api/api';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [empId, setEmpId] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (!name || !empId || !email || !mobile || !password) {
      return Alert.alert('Validation', 'Please fill all fields');
    }
    try {
      setLoading(true);
      const res = await registerRequest(name, empId, email, mobile, password);
      const data = res?.data;
      if (data?.success || data?.status === 'success') {
        Alert.alert('Success', data?.message || 'Registered successfully');
        navigation.goBack();
      } else {
        Alert.alert('Failed', data?.message || 'Could not register');
      }
    } catch (err) {
      console.error('register err', err);
      Alert.alert('Error', 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>RFCTransport</Text></View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.titleCenter}>Registration Here For RFC Transport{'\n'}<Text style={{ fontWeight: '400', fontSize: 12 }}>Please enter all your information correctly</Text></Text>

        <TextInput placeholder="Enter Name" style={styles.input} value={name} onChangeText={setName} />
        <TextInput placeholder="Enter Employee Id" style={styles.input} value={empId} onChangeText={setEmpId} />
        <TextInput placeholder="Enter Your Mail ID" keyboardType="email-address" style={styles.input} value={email} onChangeText={setEmail} />
        <TextInput placeholder="Mobile Number" keyboardType="phone-pad" style={styles.input} value={mobile} onChangeText={setMobile} />
        <TextInput placeholder="Password" secureTextEntry style={styles.input} value={password} onChangeText={setPassword} />

        <TouchableOpacity style={styles.bigButton} onPress={onSubmit} disabled={loading}>
          <Text style={styles.bigButtonText}>{loading ? 'Please wait...' : 'SUBMIT'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
