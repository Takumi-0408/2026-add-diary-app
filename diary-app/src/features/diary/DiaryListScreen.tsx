import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { DiaryStackParamList } from '../../app/navigation/DiaryStack';
import { fetchDiaries } from '../../services/diaryService';
import { Diary } from '../../types';
import { formatDate } from '../../utils';
import { DiaryCard } from '../common/DiaryCard';

type DiaryListNav = NativeStackNavigationProp<DiaryStackParamList, 'DiaryList'>;

export function DiaryListScreen() {
  const navigation = useNavigation<DiaryListNav>();
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDiaries = useCallback(async () => {
    const user = getAuth().currentUser;
    if (!user) return;
    const { diaries: data } = await fetchDiaries(user.uid, 10);
    setDiaries(data);
  }, []);

  useEffect(() => {
    loadDiaries().finally(() => setLoading(false));
  }, [loadDiaries]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadDiaries();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#5b8a3a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>日記一覧</Text>
        <TouchableOpacity onPress={() => navigation.navigate('DiaryCreate')}>
          <Text style={styles.createBtn}>作成</Text>
        </TouchableOpacity>
      </View>
      {diaries.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>はじめての日記を書こう</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('DiaryCreate')}>
            <Text style={styles.emptyBtnText}>日記を書く</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={diaries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DiaryCard
              diary={item}
              onPress={() => navigation.navigate('DiaryDetail', { diaryId: item.id })}
            />
          )}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf5e6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#faf5e6' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 48, backgroundColor: '#faf5e6', borderBottomWidth: 1, borderBottomColor: '#c8c0a8' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a1612' },
  createBtn: { fontSize: 16, color: '#5b8a3a', fontWeight: 'bold' },
  list: { padding: 16 },
  emptyText: { fontSize: 16, color: '#a39e8e', marginBottom: 16 },
  emptyBtn: { backgroundColor: '#5b8a3a', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  emptyBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
