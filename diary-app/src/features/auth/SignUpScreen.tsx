import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { AuthStackParamList } from '../../app/navigation/AuthStack';
import { signUp } from '../../services/authService';
import { colors, borderRadius } from '../../utils/theme';

type SignUpNav = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

export function SignUpScreen() {
  const navigation = useNavigation<SignUpNav>();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    if (!displayName || !email || !password) {
      Alert.alert('エラー', 'すべての項目を入力してください');
      return;
    }
    if (password.length < 6) {
      Alert.alert('エラー', 'パスワードは6文字以上で入力してください');
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, displayName);
    } catch (e: any) {
      Alert.alert('登録エラー', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>新規登録</Text>
      <TextInput
        style={styles.input}
        placeholder="表示名"
        placeholderTextColor="#a39e8e"
        value={displayName}
        onChangeText={setDisplayName}
      />
      <TextInput
        style={styles.input}
        placeholder="メールアドレス"
        placeholderTextColor="#a39e8e"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="パスワード（6文字以上）"
        placeholderTextColor="#a39e8e"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>登録</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>ログイン画面に戻る</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.paper2 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 32, color: colors.ink },
  input: { borderWidth: 1, borderColor: colors.rule, borderRadius: borderRadius.md, padding: 12, fontSize: 16, marginBottom: 16, backgroundColor: colors.white, color: colors.ink },
  button: { backgroundColor: colors.grass, padding: 14, borderRadius: borderRadius.md, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: 'bold' },
  link: { color: colors.grass, textAlign: 'center', fontSize: 14 },
});
