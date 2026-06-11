import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Diary } from '../../types';
import { formatDate } from '../../utils';

interface DiaryCardProps {
  diary: Diary;
  onPress: () => void;
}

export function DiaryCard({ diary, onPress }: DiaryCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <Text style={styles.icon}>{diary.icon}</Text>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{diary.title}</Text>
          <Text style={styles.date}>{formatDate(diary.date)}</Text>
        </View>
      </View>
      <Text style={styles.body} numberOfLines={2}>{diary.body}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#c8c0a8' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  icon: { fontSize: 28, marginRight: 10 },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#1a1612' },
  date: { fontSize: 12, color: '#a39e8e', marginTop: 2 },
  body: { fontSize: 14, color: '#5a554a', lineHeight: 20 },
});
