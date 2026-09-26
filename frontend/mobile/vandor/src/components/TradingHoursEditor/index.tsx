import React, { useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import TimePickerModal from '../TimePickerModal';
import { useThemeColors } from '../../styles/theme';

export interface DayHours {
  day: string;
  isOpen: boolean;
  openTime: string; // "HH:mm"
  closeTime: string; // "HH:mm"
}

export const DEFAULT_TRADING_HOURS: DayHours[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
].map((day) => ({ day, isOpen: true, openTime: '08:00', closeTime: '18:00' }));

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

function summarize(hours: DayHours[]): string {
  const openDays = hours.filter((d) => d.isOpen);
  const closedDays = hours.filter((d) => !d.isOpen);

  if (openDays.length === 0) return 'Closed all week';

  const allSame = openDays.every(
    (d) => d.openTime === openDays[0].openTime && d.closeTime === openDays[0].closeTime
  );

  if (!allSame) return `${openDays.length} of 7 days open · hours vary`;

  const range = `${formatTime(openDays[0].openTime)} – ${formatTime(openDays[0].closeTime)}`;
  if (closedDays.length === 0) return `${range} · every day`;
  return `${range} · closed ${closedDays.map((d) => d.day.slice(0, 3)).join(', ')}`;
}

interface TradingHoursEditorProps {
  hours: DayHours[];
  onChange: (next: DayHours[]) => void;
}

export default function TradingHoursEditor({ hours, onChange }: TradingHoursEditorProps) {
  const colors = useThemeColors();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState<{ index: number; field: 'openTime' | 'closeTime' } | null>(null);

  const updateDay = (index: number, patch: Partial<DayHours>) => {
    onChange(hours.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  };

  const applyMondayToAll = () => {
    const monday = hours[0];
    onChange(
      hours.map((d, i) =>
        i === 0 ? d : { ...d, isOpen: monday.isOpen, openTime: monday.openTime, closeTime: monday.closeTime }
      )
    );
  };

  const editingDay = editing ? hours[editing.index] : null;

  return (
    <View className="rounded-2xl border border-border bg-card">
      <Pressable
        onPress={() => setExpanded((e) => !e)}
        className="flex-row items-center justify-between px-4 py-3.5"
      >
        <View className="flex-1 flex-row items-center gap-2.5 pr-3">
          <Feather name="clock" size={15} color={colors.mutedForeground} />
          <Text className="flex-1 text-sm text-foreground" numberOfLines={1}>
            {summarize(hours)}
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Text className="text-xs font-semibold text-primary">{expanded ? 'Hide' : 'View All'}</Text>
          <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={15} color={colors.primary} />
        </View>
      </Pressable>

      {expanded && (
        <View className="border-t border-border">
          {hours.map((day, index) => (
            <View key={day.day} className={`px-4 py-3 ${index === hours.length - 1 ? '' : 'border-b border-border'}`}>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-medium text-foreground">{day.day}</Text>
                <Switch
                  value={day.isOpen}
                  onValueChange={(v) => updateDay(index, { isOpen: v })}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.card}
                />
              </View>

              {day.isOpen ? (
                <View className="mt-2.5 flex-row items-center gap-2.5">
                  <Pressable
                    onPress={() => setEditing({ index, field: 'openTime' })}
                    className="flex-1 flex-row items-center justify-between rounded-lg border border-border bg-background px-3 py-2"
                  >
                    <Text className="text-xs text-muted-foreground">Opens</Text>
                    <Text className="text-sm font-medium text-foreground">{formatTime(day.openTime)}</Text>
                  </Pressable>
                  <Feather name="arrow-right" size={13} color={colors.mutedForeground} />
                  <Pressable
                    onPress={() => setEditing({ index, field: 'closeTime' })}
                    className="flex-1 flex-row items-center justify-between rounded-lg border border-border bg-background px-3 py-2"
                  >
                    <Text className="text-xs text-muted-foreground">Closes</Text>
                    <Text className="text-sm font-medium text-foreground">{formatTime(day.closeTime)}</Text>
                  </Pressable>
                </View>
              ) : (
                <Text className="mt-1.5 text-sm text-muted-foreground">Closed</Text>
              )}

              {index === 0 && (
                <Pressable onPress={applyMondayToAll} className="mt-3 flex-row items-center gap-1.5 self-start">
                  <Feather name="copy" size={12} color={colors.primary} />
                  <Text className="text-xs font-semibold text-primary">Use these hours for every day</Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>
      )}

      <TimePickerModal
        visible={!!editing}
        title={editing ? `${hours[editing.index]?.day} — ${editing.field === 'openTime' ? 'Opens at' : 'Closes at'}` : ''}
        value={editingDay ? editingDay[editing!.field] : '08:00'}
        onSelect={(time) => {
          if (editing) updateDay(editing.index, { [editing.field]: time } as Partial<DayHours>);
        }}
        onClose={() => setEditing(null)}
      />
    </View>
  );
}
