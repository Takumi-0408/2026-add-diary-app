import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { DocumentSnapshot } from 'firebase/firestore';
import { DiaryStackParamList } from '../../app/navigation/DiaryStack';
import { fetchDiaries } from '../../services/diaryService';
import { Diary } from '../../types';
import { DiaryCard } from '../common/DiaryCard';
import { colors, borderRadius } from '../../utils/theme';

type DiaryListNav = NativeStackNavigationProp<DiaryStackParamList, 'DiaryList'>;

const PAGE_SIZE = 10;

export function DiaryListScreen() {
  const navigation = useNavigation<DiaryListNav>();
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cursor, setCursor] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  const filteredDiaries = useMemo(() => {
    if (!searchKeyword.trim()) return diaries;
    const kw = searchKeyword.toLowerCase();
    return diaries.filter(
      (d) =>
        d.title.toLowerCase().includes(kw) ||
        d.body.toLowerCase().includes(kw)
    );
  }, [diaries, searchKeyword]);

  const loadDiaries = useCallback(async () => {
    const user = getAuth().currentUser;
    if (!user) return;
    try {
      const result = await fetchDiaries(user.uid, PAGE_SIZE);
      setDiaries(result.diaries);
      setCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } catch (e: any) {
      Alert.alert('エラー', e.message || '日記の読み込みに失敗しました');
    }
  }, []);

  useEffect(() => {
    loadDiaries().finally(() => setLoading(false));
  }, [loadDiaries]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadDiaries();
    setRefreshing(false);
  }

  async function handleLoadMore() {
    if (!hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    const user = getAuth().currentUser;
    if (!user) { setLoadingMore(false); return; }
    try {
      const result = await fetchDiaries(user.uid, PAGE_SIZE, cursor ?? undefined);
      setDiaries((prev) => [...prev, ...result.diaries]);
      setCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } catch (e: any) {
      Alert.alert('エラー', e.message || '読み込みに失敗しました');
    } finally {
      setLoadingMore(false);
    }
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
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="日記を検索..."
          placeholderTextColor="#a39e8e"
          value={searchKeyword}
          onChangeText={setSearchKeyword}
        />
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
          data={filteredDiaries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DiaryCard
              diary={item}
              onPress={() => navigation.navigate('DiaryDetail', { diaryId: item.id })}
            />
          )}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            searchKeyword.trim() && filteredDiaries.length > 0 ? (
              <Text style={styles.hitCount}>{filteredDiaries.length} 件表示</Text>
            ) : null
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footer}>
                <ActivityIndicator size="small" color="#5b8a3a" />
                <Text style={styles.footerText}>読み込み中...</Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper2 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.paper2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 48, backgroundColor: colors.paper2, borderBottomWidth: 1, borderBottomColor: colors.rule },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.ink },
  createBtn: { fontSize: 16, color: colors.grass, fontWeight: 'bold' },
  searchBar: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.paper2 },
  searchInput: { borderWidth: 1, borderColor: colors.rule, borderRadius: borderRadius.md, padding: 10, fontSize: 14, backgroundColor: colors.white, color: colors.ink },
  list: { padding: 16 },
  emptyText: { fontSize: 16, color: colors.inkFaint, marginBottom: 16 },
  emptyBtn: { backgroundColor: colors.grass, paddingHorizontal: 24, paddingVertical: 12, borderRadius: borderRadius.md },
  emptyBtnText: { color: colors.white, fontSize: 16, fontWeight: 'bold' },
  hitCount: { fontSize: 12, color: colors.inkFaint, marginBottom: 8 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, gap: 8 },
  footerText: { fontSize: 12, color: colors.inkFaint },
});
