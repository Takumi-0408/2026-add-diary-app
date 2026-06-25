import { TouchableOpacity, Text, View, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { Diary } from '../../types';
import { formatDate } from '../../utils';
import { colors, borderRadius, spacing } from '../../utils/theme';

interface DiaryCardProps {
  diary: Diary;
  onPress: () => void;
}

export function DiaryCard({ diary, onPress }: DiaryCardProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  return (
    <Animated.View style={{ opacity }}>
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: 10, borderWidth: 1, borderColor: colors.rule },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  icon: { fontSize: 28, marginRight: 10 },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold', color: colors.ink },
  date: { fontSize: 12, color: colors.inkFaint, marginTop: 2 },
  body: { fontSize: 14, color: colors.inkSoft, lineHeight: 20 },
});
