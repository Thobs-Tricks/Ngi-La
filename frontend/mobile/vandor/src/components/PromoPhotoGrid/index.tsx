import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '../../styles/theme';

interface PromoPhotoGridProps {
  photos: string[];
  maxPhotos?: number;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

// A fixed 5-slot grid: filled slots show the photo with a remove button, the
// first empty slot is the "add" affordance, and any slots after that are
// just quiet placeholders so it's obvious how many more can be added.
export default function PromoPhotoGrid({ photos, maxPhotos = 5, onAdd, onRemove }: PromoPhotoGridProps) {
  const colors = useThemeColors();
  const slots = Array.from({ length: maxPhotos });
  const nextEmptyIndex = photos.length;

  return (
    <View className="flex-row flex-wrap gap-2.5">
      {slots.map((_, index) => {
        const uri = photos[index];

        if (uri) {
          return (
            <View key={index} className="aspect-square w-[30%] overflow-hidden rounded-xl border border-border">
              <Image source={{ uri }} className="h-full w-full" resizeMode="cover" />
              <Pressable
                onPress={() => onRemove(index)}
                className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full bg-black/55"
              >
                <Feather name="x" size={13} color="#FFFFFF" />
              </Pressable>
            </View>
          );
        }

        if (index === nextEmptyIndex) {
          return (
            <Pressable
              key={index}
              onPress={onAdd}
              className="aspect-square w-[30%] items-center justify-center rounded-xl border border-dashed border-primary/50 bg-primary/5"
            >
              <Feather name="plus" size={18} color={colors.primary} />
            </Pressable>
          );
        }

        return (
          <View
            key={index}
            className="aspect-square w-[30%] items-center justify-center rounded-xl border border-dashed border-border bg-card"
          >
            <Feather name="image" size={16} color={colors.mutedForeground} />
          </View>
        );
      })}
    </View>
  );
}
