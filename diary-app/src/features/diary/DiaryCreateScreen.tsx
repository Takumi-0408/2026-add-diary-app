import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { createDiary, uploadImage } from '../../services/diaryService';
import { validateDiaryForm } from '../../utils';
import { EmojiPicker } from '../common/EmojiPicker';

export function DiaryCreateScreen() {
  const navigation = useNavigation();
  const [icon, setIcon] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [date, setDate] = useState(new Date());
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const validation = validateDiaryForm({ icon, title, body, date, imageUrl: imageUri });
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      Alert.alert('入力エラー', firstError);
      return;
    }
    setSaving(true);
    try {
      const user = getAuth().currentUser;
      if (!user) return;
      let imageUrl: string | undefined;
      if (imageUri) {
        imageUrl = await uploadImage(user.uid, imageUri);
      }
      await createDiary(user.uid, { icon, title, body, date, imageUrl });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('保存エラー', e.message);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (icon || title || body) {
      Alert.alert('確認', '保存されていない変更があります', [
        { text: 'キャンセル', style: 'cancel' },
        { text: '戻る', onPress: () => navigation.goBack() },
      ]);
    } else {
      navigation.goBack();
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}><Text style={styles.cancelBtn}>キャンセル</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>新しい日記</Text>
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
        {imageUri && (
          <View>
            <Image source={{ uri: imageUri }} style={styles.preview} />
            <TouchableOpacity onPress={() => setImageUri(undefined)}>
              <Text style={styles.removeBtn}>画像を削除</Text>
            </TouchableOpacity>
          </View>
        )}
        {!imageUri && (
          <TouchableOpacity style={styles.imageBtn} onPress={async () => {
            const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
            if (!result.canceled && result.assets[0]) {
              setImageUri(result.assets[0].uri);
            }
          }}>
            <Text style={styles.imageBtnText}>画像を追加</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf5e6' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 48, backgroundColor: '#faf5e6', borderBottomWidth: 1, borderBottomColor: '#c8c0a8' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1612' },
  cancelBtn: { fontSize: 14, color: '#a39e8e' },
  saveBtn: { fontSize: 16, color: '#5b8a3a', fontWeight: 'bold' },
  form: { padding: 16 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#1a1612', marginBottom: 8, marginTop: 16 },
  input: { borderWidth: 1, borderColor: '#c8c0a8', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff', color: '#1a1612' },
  textArea: { borderWidth: 1, borderColor: '#c8c0a8', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff', color: '#1a1612', minHeight: 200, textAlignVertical: 'top' },
  preview: { width: '100%', height: 200, borderRadius: 8, marginTop: 12 },
  imageBtn: { borderWidth: 1, borderColor: '#c8c0a8', borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 12, borderStyle: 'dashed' },
  imageBtnText: { color: '#a39e8e', fontSize: 14 },
  removeBtn: { color: '#d97757', fontSize: 12, textAlign: 'center', marginTop: 8 },
});
