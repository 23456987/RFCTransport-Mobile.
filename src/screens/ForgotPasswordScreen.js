import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import styles from '../AppStyles';
import { forgotPasswordRequest } from '../api/api';

export default function ForgotPasswordScreen({ navigation }) {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);

  async function onReset() {
    if (!identifier) return Alert.alert('Validation', 'Please enter email or mobile');
    try {
      setLoading(true);
      const res = await forgotPasswordRequest(identifier);
      const data = res?.data ?? res;
      if (data?.success || data?.status === 'success') {
        Alert.alert('Success', data?.message || 'Reset instructions sent (placeholder)');
        navigation.goBack();
      } else {
        Alert.alert('Failed', data?.message || 'Could not reset password');
      }
    } catch (err) {
      console.error('forgot err', err);
      Alert.alert('Error', 'Unable to process request');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>RFCTransport</Text></View>

      <View style={styles.content}>
        <Text style={{ textAlign: 'center', marginBottom: 12, color: '#b33d3d', fontWeight: '700' }}>Forgot Password</Text>
        <TextInput placeholder="Enter email or mobile" style={styles.input} value={identifier} onChangeText={setIdentifier} />
        <TouchableOpacity style={styles.bigButton} onPress={onReset} disabled={loading}>
          <Text style={styles.bigButtonText}>{loading ? 'Please wait...' : 'RESET'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
