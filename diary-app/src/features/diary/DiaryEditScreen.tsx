import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { DiaryStackParamList } from '../../app/navigation/DiaryStack';
import { fetchDiaryById, updateDiary } from '../../services/diaryService';
import { validateDiaryForm } from '../../utils';
import { EmojiPicker } from '../common/EmojiPicker';
import { colors, borderRadius } from '../../utils/theme';

type EditRoute = RouteProp<DiaryStackParamList, 'DiaryEdit'>;

export function DiaryEditScreen() {
  const navigation = useNavigation();
  const route = useRoute<EditRoute>();
  const { diaryId } = route.params;
  const [icon, setIcon] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDiaryById(diaryId)
      .then((diary) => {
        setIcon(diary.icon);
        setTitle(diary.title);
        setBody(diary.body);
        setDate(diary.date);
      })
      .catch((e: any) => {
        Alert.alert('エラー', e.message || '日記の読み込みに失敗しました');
      })
      .finally(() => setLoading(false));
  }, [diaryId]);

  async function handleSave() {
    const validation = validateDiaryForm({ icon, title, body, date });
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      Alert.alert('入力エラー', firstError);
      return;
    }
    setSaving(true);
    try {
      await updateDiary(diaryId, { icon, title, body, date });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('保存エラー', e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#5b8a3a" /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.cancelBtn}>キャンセル</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>日記を編集</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#5b8a3a" /> : <Text style={styles.saveBtn}>保存</Text>}
        </TouchableOpacity>
      </View>
      <View style={styles.form}>
        <Text style={styles.label}>アイコン</Text>
        <EmojiPicker selected={icon} onSelect={setIcon} />
        <Text style={styles.label}>タイトル</Text>
        <TextInput style={styles.input} placeholder="タイトル" placeholderTextColor="#a39e8e" value={title} onChangeText={setTitle} maxLength={50} />
        <Text style={styles.label}>日付</Text>
        <TextInput style={styles.input} value={date.toLocaleDateString('ja-JP')} editable={false} />
        <Text style={styles.label}>本文</Text>
        <TextInput style={styles.textArea} placeholder="今日の出来事を書こう" placeholderTextColor="#a39e8e" value={body} onChangeText={setBody} multiline maxLength={5000} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper2 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.paper2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 48, backgroundColor: colors.paper2, borderBottomWidth: 1, borderBottomColor: colors.rule },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.ink },
  cancelBtn: { fontSize: 14, color: colors.inkFaint },
  saveBtn: { fontSize: 16, color: colors.grass, fontWeight: 'bold' },
  form: { padding: 16 },
  label: { fontSize: 14, fontWeight: 'bold', color: colors.ink, marginBottom: 8, marginTop: 16 },
  input: { borderWidth: 1, borderColor: colors.rule, borderRadius: borderRadius.md, padding: 12, fontSize: 16, backgroundColor: colors.white, color: colors.ink },
  textArea: { borderWidth: 1, borderColor: colors.rule, borderRadius: borderRadius.md, padding: 12, fontSize: 16, backgroundColor: colors.white, color: colors.ink, minHeight: 200, textAlignVertical: 'top' },
});
