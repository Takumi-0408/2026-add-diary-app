import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DiaryStackParamList } from '../../app/navigation/DiaryStack';
import { fetchDiaryById, deleteDiary } from '../../services/diaryService';
import { Diary } from '../../types';
import { formatDateTime } from '../../utils';

type DetailRoute = RouteProp<DiaryStackParamList, 'DiaryDetail'>;
type DetailNav = NativeStackNavigationProp<DiaryStackParamList, 'DiaryDetail'>;

export function DiaryDetailScreen() {
  const navigation = useNavigation<DetailNav>();
  const route = useRoute<DetailRoute>();
  const { diaryId } = route.params;
  const [diary, setDiary] = useState<Diary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiaryById(diaryId)
      .then(setDiary)
      .catch(() => Alert.alert('エラー', '日記の読み込みに失敗しました'))
      .finally(() => setLoading(false));
  }, [diaryId]);

  async function handleDelete() {
    Alert.alert('確認', 'この日記を削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: async () => {
        try {
          await deleteDiary(diaryId);
          navigation.goBack();
        } catch (e: any) {
          Alert.alert('エラー', e.message);
        }
      }},
    ]);
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#5b8a3a" /></View>;
  }

  if (!diary) {
    return <View style={styles.center}><Text style={styles.errorText}>日記が見つかりません</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backBtn}>戻る</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('DiaryEdit', { diaryId })}>
          <Text style={styles.editBtn}>編集</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.icon}>{diary.icon}</Text>
        <Text style={styles.title}>{diary.title}</Text>
        <Text style={styles.date}>{formatDateTime(diary.date)}</Text>
        <Text style={styles.body}>{diary.body}</Text>
        {diary.imageUrl && (
          <Image source={{ uri: diary.imageUrl }} style={styles.image} />
        )}
      </View>
      <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
        <Text style={styles.deleteBtnText}>削除</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf5e6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#faf5e6' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 48, backgroundColor: '#faf5e6', borderBottomWidth: 1, borderBottomColor: '#c8c0a8' },
  backBtn: { fontSize: 14, color: '#a39e8e' },
  editBtn: { fontSize: 16, color: '#5b8a3a', fontWeight: 'bold' },
  content: { padding: 16 },
  icon: { fontSize: 48, textAlign: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1612', marginBottom: 8 },
  date: { fontSize: 14, color: '#a39e8e', marginBottom: 24 },
  body: { fontSize: 16, lineHeight: 24, color: '#1a1612', marginBottom: 24 },
  image: { width: '100%', height: 300, borderRadius: 8, marginBottom: 24 },
  deleteBtn: { padding: 16, alignItems: 'center' },
  deleteBtnText: { color: '#d97757', fontSize: 14 },
  errorText: { fontSize: 16, color: '#a39e8e' },
});
