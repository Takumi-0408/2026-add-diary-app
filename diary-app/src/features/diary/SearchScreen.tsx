import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { SearchStackParamList } from '../../app/navigation/SearchStack';
import { searchDiaries } from '../../services/diaryService';
import { Diary } from '../../types';
import { DiaryCard } from '../common/DiaryCard';

type SearchNav = NativeStackNavigationProp<SearchStackParamList, 'SearchHome'>;

export function SearchScreen() {
  const navigation = useNavigation<SearchNav>();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<Diary[]>([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!keyword.trim()) return;
    setSearching(true);
    setSearched(true);
    const user = getAuth().currentUser;
    if (!user) { setSearching(false); return; }
    try {
      const data = await searchDiaries(user.uid, keyword);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [keyword]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>日記を検索</Text>
      </View>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="キーワードを入力"
          placeholderTextColor="#a39e8e"
          value={keyword}
          onChangeText={setKeyword}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>検索</Text>
        </TouchableOpacity>
      </View>
      {searching ? (
        <View style={styles.center}><ActivityIndicator color="#5b8a3a" /></View>
      ) : searched && results.length === 0 ? (
        <View style={styles.center}><Text style={styles.emptyText}>該当する日記が見つかりませんでした</Text></View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DiaryCard
              diary={item}
              onPress={() => navigation.navigate('DiaryDetail', { diaryId: item.id })}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf5e6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 16, paddingTop: 48, backgroundColor: '#faf5e6', borderBottomWidth: 1, borderBottomColor: '#c8c0a8' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a1612' },
  searchBar: { flexDirection: 'row', padding: 12, gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#c8c0a8', borderRadius: 8, padding: 10, fontSize: 14, backgroundColor: '#fff', color: '#1a1612' },
  searchBtn: { backgroundColor: '#5b8a3a', paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center' },
  searchBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  list: { padding: 12 },
  emptyText: { fontSize: 14, color: '#a39e8e' },
});
