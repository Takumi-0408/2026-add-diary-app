import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DiaryStackParamList } from '../../app/navigation/DiaryStack';
import { fetchDiaryById, deleteDiary } from '../../services/diaryService';
import { Diary } from '../../types';
import { formatDateTime } from '../../utils';
import { colors, borderRadius } from '../../utils/theme';

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
      </View>
      <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
        <Text style={styles.deleteBtnText}>削除</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper2 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.paper2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 48, backgroundColor: colors.paper2, borderBottomWidth: 1, borderBottomColor: colors.rule },
  backBtn: { fontSize: 14, color: colors.inkFaint },
  editBtn: { fontSize: 16, color: colors.grass, fontWeight: 'bold' },
  content: { padding: 16 },
  icon: { fontSize: 48, textAlign: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.ink, marginBottom: 8 },
  date: { fontSize: 14, color: colors.inkFaint, marginBottom: 24 },
  body: { fontSize: 16, lineHeight: 24, color: colors.ink, marginBottom: 24 },
  deleteBtn: { padding: 16, alignItems: 'center' },
  deleteBtnText: { color: colors.coral, fontSize: 14 },
  errorText: { fontSize: 16, color: colors.inkFaint },
});
