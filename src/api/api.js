import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE = 'http://202.62.74.214/transport/app/';

// NOTE: login uses index.php as you gave earlier (different path)
export const LOGIN_URL = 'http://202.62.74.214/transport/app/index.php';

// --- Auth / user ---
export async function loginRequest(username, password) {
  // your login endpoint (index.php) expects username + password as POST
  return axios.post(LOGIN_URL, { username, password });
}

// register assumed endpoint (if different, change here)
export async function registerRequest(name, empId, email, mobile, password) {
  return axios.post(`${BASE}registeruser`, {
    name, emp_id: empId, email, mobile, password
  });
}

// forgot placeholder: if you have endpoint, swap it here
export async function forgotPasswordRequest(emailOrPhone) {
  // no endpoint available — this is a placeholder returning resolved promise
  // Replace with: return axios.post(`${BASE}API003`, { email: emailOrPhone });
  return new Promise((res) => setTimeout(() => res({ data: { success: true, message: 'Reset link sent (placeholder)' } }), 800));
}

// --- transport-related endpoints (you provided) ---
export async function getUserDates(trans_user_id) {
  return axios.get(`${BASE}API006`, { params: { trans_user_id } });
}

export async function getVehicles() {
  return axios.get(`${BASE}API005`);
}

export async function getPlaces() {
  return axios.get(`${BASE}API007`);
}

export async function getRouteCounts(trans_route_id) {
  return axios.post(`${BASE}API004`, { trans_route_id });
}

export async function postTransportEntry(payload) {
  return axios.post(`${BASE}API002`, payload);
}

// helper to get stored user
export async function getStoredUser() {
  const s = await AsyncStorage.getItem('userData');
  return s ? JSON.parse(s) : null;
}
