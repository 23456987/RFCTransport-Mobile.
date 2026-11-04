import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  header: {
    height: 64,
    backgroundColor: '#d94b3b',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10
  },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '700' },
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 18 },
  input: {
    borderWidth: 1,
    borderColor: '#c94d49',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    backgroundColor: '#fff'
  },
  bigButton: {
    backgroundColor: '#d94b3b',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  bigButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  titleCenter: { textAlign: 'center', color: '#b33d3d', fontWeight: '700', marginBottom: 8 }
});
