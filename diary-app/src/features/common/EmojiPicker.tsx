import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useState } from 'react';

const EMOJIS = [
  '😊', '😢', '😡', '🥰', '😴', '🤔', '😎', '🥳',
  '🌟', '☀️', '🌙', '🌸', '🍀', '🎉', '❤️', '🔥',
  '📖', '✏️', '📷', '🎵', '🎨', '🏃', '🍰', '☕',
  '🐶', '🐱', '🐰', '🦋', '🌊', '⛰️', '🏠', '🚗',
];

interface EmojiPickerProps {
  selected: string;
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ selected, onSelect }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(!open)}>
        <Text style={styles.triggerText}>{selected || '☝️ 選んでね'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.grid}>
          {EMOJIS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={[styles.item, selected === emoji && styles.selected]}
              onPress={() => { onSelect(emoji); setOpen(false); }}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: { borderWidth: 1, borderColor: '#c8c0a8', borderRadius: 8, padding: 12, backgroundColor: '#fff', alignItems: 'center' },
  triggerText: { fontSize: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 6 },
  item: { width: '12.5%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#c8c0a8' },
  selected: { borderColor: '#5b8a3a', backgroundColor: '#cfe1b8' },
  emoji: { fontSize: 24 },
});
