import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { logOut } from '../../services/authService';
import { colors } from '../../utils/theme';

export function SettingsScreen() {
  const user = getAuth().currentUser;

  async function handleLogout() {
    Alert.alert('確認', 'ログアウトしますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: 'ログアウト', onPress: async () => {
        try {
          await logOut();
        } catch (e: any) {
          Alert.alert('エラー', e.message);
        }
      }},
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>設定</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>メールアドレス</Text>
        <Text style={styles.value}>{user?.email || '-'}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>表示名</Text>
        <Text style={styles.value}>{user?.displayName || '-'}</Text>
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>ログアウト</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper2 },
  header: { padding: 16, paddingTop: 48, backgroundColor: colors.paper2, borderBottomWidth: 1, borderBottomColor: colors.rule },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.ink },
  section: { padding: 16, borderBottomWidth: 1, borderBottomColor: colors.rule },
  label: { fontSize: 12, color: colors.inkFaint, marginBottom: 4 },
  value: { fontSize: 16, color: colors.ink },
  logoutBtn: { padding: 16, alignItems: 'center', marginTop: 32 },
  logoutBtnText: { color: colors.coral, fontSize: 14 },
});
