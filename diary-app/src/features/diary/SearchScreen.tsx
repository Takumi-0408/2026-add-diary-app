import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useState, useCallback } from 'react';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { SearchStackParamList } from '../../app/navigation/SearchStack';
import { searchDiariesAdvanced } from '../../services/diaryService';
import { Diary } from '../../types';
import { formatDate } from '../../utils';
import { DiaryCard } from '../common/DiaryCard';
import { EMOJIS } from '../common/EmojiPicker';
import { colors, borderRadius } from '../../utils/theme';

type SearchNav = NativeStackNavigationProp<SearchStackParamList, 'SearchHome'>;

export function SearchScreen() {
  const navigation = useNavigation<SearchNav>();
  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [results, setResults] = useState<Diary[]>([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!keyword.trim() && !startDate && !endDate && !selectedEmoji) return;
    setSearching(true);
    setSearched(true);
    const user = getAuth().currentUser;
    if (!user) { setSearching(false); return; }
    try {
      const data = await searchDiariesAdvanced(user.uid, {
        keyword: keyword.trim() || undefined,
        startDate: startDate ?? undefined,
        endDate: endDate ?? undefined,
        emoji: selectedEmoji || undefined,
      });
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [keyword, startDate, endDate, selectedEmoji]);

  function clearFilters() {
    setKeyword('');
    setStartDate(null);
    setEndDate(null);
    setSelectedEmoji('');
    setResults([]);
    setSearched(false);
  }

  function onStartDateChange(_: DateTimePickerEvent, date?: Date) {
    setShowStartPicker(Platform.OS === 'ios');
    if (date) setStartDate(date);
  }

  function onEndDateChange(_: DateTimePickerEvent, date?: Date) {
    setShowEndPicker(Platform.OS === 'ios');
    if (date) setEndDate(date);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>日記を検索</Text>
        {(keyword || startDate || endDate || selectedEmoji) && (
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearBtn}>クリア</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filters}>
        <TextInput
          style={styles.input}
          placeholder="キーワード"
          placeholderTextColor="#a39e8e"
          value={keyword}
          onChangeText={setKeyword}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />

        <View style={styles.dateRow}>
          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowStartPicker(true)}>
            <Text style={styles.dateLabel}>開始</Text>
            <Text style={styles.dateValue}>{startDate ? formatDate(startDate) : '未設定'}</Text>
          </TouchableOpacity>
          <Text style={styles.dateSep}>〜</Text>
          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowEndPicker(true)}>
            <Text style={styles.dateLabel}>終了</Text>
            <Text style={styles.dateValue}>{endDate ? formatDate(endDate) : '未設定'}</Text>
          </TouchableOpacity>
        </View>

        {showStartPicker && (
          <DateTimePicker
            value={startDate ?? new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onStartDateChange}
            maximumDate={endDate ?? undefined}
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            value={endDate ?? new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onEndDateChange}
            minimumDate={startDate ?? undefined}
          />
        )}

        <Text style={styles.filterLabel}>アイコン</Text>
        <View style={styles.emojiGrid}>
          {EMOJIS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={[styles.emojiItem, selectedEmoji === emoji && styles.emojiSelected]}
              onPress={() => setSelectedEmoji(selectedEmoji === emoji ? '' : emoji)}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>検索</Text>
        </TouchableOpacity>
      </View>

      {searching ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#5b8a3a" /></View>
      ) : searched && results.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>該当する日記が見つかりませんでした</Text>
        </View>
      ) : searched ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DiaryCard
              diary={item}
              onPress={() => navigation.navigate('DiaryDetail', { diaryId: item.id })}
            />
          )}
          ListHeaderComponent={
            <Text style={styles.hitCount}>{results.length} 件見つかりました</Text>
          }
          contentContainerStyle={styles.list}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper2 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 48, backgroundColor: colors.paper2, borderBottomWidth: 1, borderBottomColor: colors.rule },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.ink },
  clearBtn: { fontSize: 14, color: colors.coral, fontWeight: 'bold' },
  filters: { padding: 16 },
  input: { borderWidth: 1, borderColor: colors.rule, borderRadius: borderRadius.md, padding: 12, fontSize: 14, backgroundColor: colors.white, color: colors.ink, marginBottom: 12 },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  dateBtn: { flex: 1, borderWidth: 1, borderColor: colors.rule, borderRadius: borderRadius.md, padding: 10, backgroundColor: colors.white },
  dateLabel: { fontSize: 10, color: colors.inkFaint, marginBottom: 2 },
  dateValue: { fontSize: 14, color: colors.ink },
  dateSep: { marginHorizontal: 8, fontSize: 14, color: colors.inkFaint },
  filterLabel: { fontSize: 14, fontWeight: 'bold', color: colors.ink, marginBottom: 8 },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  emojiItem: { width: '12.5%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: borderRadius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.rule },
  emojiSelected: { borderColor: colors.grass, backgroundColor: colors.grassSoft },
  emojiText: { fontSize: 22 },
  searchBtn: { backgroundColor: colors.grass, paddingVertical: 12, borderRadius: borderRadius.md, alignItems: 'center', marginTop: 4 },
  searchBtnText: { color: colors.white, fontWeight: 'bold', fontSize: 16 },
  list: { padding: 16, paddingTop: 0 },
  hitCount: { fontSize: 12, color: colors.inkFaint, marginBottom: 8 },
  emptyText: { fontSize: 14, color: colors.inkFaint },
});
