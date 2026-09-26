import React, { useMemo, useRef } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '../../styles/theme';

interface TimePickerModalProps {
  visible: boolean;
  title: string;
  value: string; // "HH:mm"
  onSelect: (time: string) => void;
  onClose: () => void;
}

const ROW_HEIGHT = 46;

function buildTimes(): string[] {
  const times: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return times;
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

const TIMES = buildTimes();

// A JS-only time picker — @react-native-community/datetimepicker needs a
// custom dev build and isn't available in Expo Go, which is how this app
// gets tested, so this avoids that dependency entirely.
export default function TimePickerModal({ visible, title, value, onSelect, onClose }: TimePickerModalProps) {
  const colors = useThemeColors();
  const listRef = useRef<FlatList<string>>(null);
  const initialIndex = useMemo(() => Math.max(TIMES.indexOf(value), 0), [value]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40" onPress={onClose}>
        <Pressable className="mt-auto max-h-[70%] rounded-t-3xl bg-card" onPress={(e) => e.stopPropagation()}>
          <View className="flex-row items-center justify-between border-b border-border px-5 py-4">
            <Text className="text-base font-semibold text-foreground">{title}</Text>
            <Pressable onPress={onClose} className="h-8 w-8 items-center justify-center">
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <FlatList
            ref={listRef}
            data={TIMES}
            keyExtractor={(t) => t}
            getItemLayout={(_, index) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index })}
            initialScrollIndex={initialIndex}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const active = item === value;
              return (
                <Pressable
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                  style={{ height: ROW_HEIGHT }}
                  className={`flex-row items-center justify-between px-5 ${active ? 'bg-primary/10' : ''}`}
                >
                  <Text className={`text-base ${active ? 'font-semibold text-primary' : 'text-foreground'}`}>
                    {formatTime(item)}
                  </Text>
                  {active && <Feather name="check" size={16} color={colors.primary} />}
                </Pressable>
              );
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
