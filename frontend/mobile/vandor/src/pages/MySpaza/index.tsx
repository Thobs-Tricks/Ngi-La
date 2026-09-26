import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenContainer from '../../layout/ScreenContainer';
import AppStatusBar from '../../components/AppStatusBar';
import TextField from '../../components/TextField';
import PrimaryButton from '../../components/PrimaryButton';
import PromoPhotoGrid from '../../components/PromoPhotoGrid';
import TradingHoursEditor, { DEFAULT_TRADING_HOURS, DayHours } from '../../components/TradingHoursEditor';
import { useAuth } from '../../hooks/useAuth';
import { useThemeColors } from '../../styles/theme';
import { getCategories } from '../../api/categories';
import { getMyVendor, upsertMyVendor, updateTradingHours as putTradingHours, updatePhotos as putPromoPhotos } from '../../api/vendors';
import { uploadMedia } from '../../api/media';
import type { Category } from '../../types';
import type { MySpazaStackParamList } from '../../router/types';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

function staticMapUrl(lat: number, lng: number, color: string) {
  const hex = color.replace('#', '0x');
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=640x260&scale=2&markers=color:${hex}%7C${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
}

// Confirmed live 2026-09: the trading-hours endpoint takes and returns plain
// "HH:mm" (no seconds), and a closed day's openTime/closeTime come back as
// null rather than a placeholder time.
function toApiTime(time: string): string {
  return time.slice(0, 5);
}
function fromApiTime(time: string | null, fallback: string): string {
  if (!time) return fallback;
  return time.slice(0, 5);
}

function isHostedUrl(uri: string): boolean {
  return /^https?:\/\//i.test(uri);
}

export default function MySpazaScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MySpazaStackParamList>>();
  const route = useRoute<RouteProp<MySpazaStackParamList, 'MySpazaForm'>>();
  const { session } = useAuth();
  const colors = useThemeColors();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [locationDescription, setLocationDescription] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [contactPhone, setContactPhone] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profileLoading, setProfileLoading] = useState(true);
  // GET /vendors/me returns category display NAMES, not ids, so we stash
  // them here and resolve to ids once the /categories list has loaded.
  const [pendingCategoryNames, setPendingCategoryNames] = useState<string[] | null>(null);

  const [rating, setRating] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const [tradingHours, setTradingHours] = useState<DayHours[]>(DEFAULT_TRADING_HOURS);
  const [hoursSaving, setHoursSaving] = useState(false);
  const [hoursSaved, setHoursSaved] = useState(false);
  const [hoursError, setHoursError] = useState<string | null>(null);

  const [promoPhotos, setPromoPhotos] = useState<string[]>([]);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSaved, setPromoSaved] = useState(false);
  const [promoSaving, setPromoSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getCategories(session?.accessToken);
        if (!cancelled) setCategories(data);
      } catch {
        if (!cancelled) setCategoriesError("Couldn't load categories — pull to try again.");
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load the vendor's existing spaza profile, if one already exists, so this
  // screen opens straight into the summary/edit view instead of a blank form.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!session?.accessToken) {
        setProfileLoading(false);
        return;
      }
      try {
        const vendor = await getMyVendor(session.accessToken);
        if (cancelled || !vendor) return;

        setBusinessName(vendor.businessName);
        setDescription(vendor.description);
        // categoryIds comes back empty from GET (it only gives display
        // names) — resolve names to ids once /categories has loaded.
        if (vendor.categoryIds.length > 0) setSelectedCategoryIds(vendor.categoryIds);
        else if (vendor.categoryNames.length > 0) setPendingCategoryNames(vendor.categoryNames);
        setLocationDescription(vendor.locationDescription);
        setContactPhone(vendor.contactPhone);
        if (vendor.imageUrl) setImageUri(vendor.imageUrl);
        if (vendor.latitude != null && vendor.longitude != null) {
          setCoords({ lat: vendor.latitude, lng: vendor.longitude });
        }
        if (vendor.tradingHours.length > 0) {
          setTradingHours(
            vendor.tradingHours.map((h) => ({
              day: h.day,
              isOpen: h.isOpen,
              openTime: fromApiTime(h.openTime, '08:00'),
              closeTime: fromApiTime(h.closeTime, '18:00'),
            }))
          );
        }
        if (vendor.photoUrls.length > 0) setPromoPhotos(vendor.photoUrls);
        setRating(vendor.rating);
        setReviewsCount(vendor.reviewsCount);
        setIsVerified(vendor.isVerified);
        setClaimed(vendor.claimed);
        setSaved(true);
      } catch {
        // No profile yet (or a transient error) — leave the create form showing.
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  // Resolve pending category names (from GET /vendors/me) to ids once the
  // /categories list has loaded.
  useEffect(() => {
    if (!pendingCategoryNames || categories.length === 0) return;
    const matched = categories
      .filter((c) => pendingCategoryNames.some((name) => name.trim().toLowerCase() === c.name.trim().toLowerCase()))
      .map((c) => c.id);
    if (matched.length > 0) setSelectedCategoryIds(matched);
    setPendingCategoryNames(null);
  }, [pendingCategoryNames, categories]);

  // Picks up the pin dropped on the MapPicker screen when it navigates back
  // here with new params.
  useEffect(() => {
    const { lat, lng } = route.params ?? {};
    if (typeof lat !== 'number' || typeof lng !== 'number') return;

    setCoords({ lat, lng });
    setFormError(null);

    if (!locationDescription) {
      Location.reverseGeocodeAsync({ latitude: lat, longitude: lng })
        .then((results: Location.LocationGeocodedAddress[]) => {
          const place = results[0];
          if (!place) return;
          const parts = [place.street ?? place.name, place.district, place.city].filter(Boolean);
          if (parts.length) setLocationDescription(parts.join(', '));
        })
        .catch(() => {
          // soft-fail — the vendor can still type the address in by hand
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.lat, route.params?.lng]);

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
    setFormError(null);
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setFormError(null);

    if (!businessName.trim()) {
      setFormError('Please give your spaza a name.');
      return;
    }
    if (selectedCategoryIds.length === 0) {
      setFormError('Pick at least one category that fits what you sell.');
      return;
    }
    if (!locationDescription.trim()) {
      setFormError('Add an address or description of where you are.');
      return;
    }
    if (!contactPhone.trim()) {
      setFormError('Add a contact number customers can reach you on.');
      return;
    }
    if (!session?.accessToken) {
      setFormError("You're not signed in — please log in again.");
      return;
    }

    setIsSaving(true);
    try {
      let hostedImageUrl = '';
      if (imageUri) {
        if (isHostedUrl(imageUri)) {
          hostedImageUrl = imageUri;
        } else {
          const uploaded = await uploadMedia(imageUri, session.accessToken);
          hostedImageUrl = uploaded.url;
          setImageUri(uploaded.url);
        }
      }

      await upsertMyVendor(session.accessToken, {
        businessName: businessName.trim(),
        description: description.trim(),
        categoryIds: selectedCategoryIds,
        locationDescription: locationDescription.trim(),
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
        contactPhone: contactPhone.trim(),
        imageUrl: hostedImageUrl,
      });
      setSaved(true);
    } catch (e: any) {
      setFormError(e?.message ?? "Couldn't save your spaza profile — please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveHours = async () => {
    if (!session?.accessToken) return;
    setHoursSaving(true);
    setHoursError(null);
    try {
      await putTradingHours(
        session.accessToken,
        tradingHours.map((h) => ({
          day: h.day,
          isOpen: h.isOpen,
          openTime: h.isOpen ? toApiTime(h.openTime) : null,
          closeTime: h.isOpen ? toApiTime(h.closeTime) : null,
        }))
      );
      setHoursSaved(true);
    } catch (e: any) {
      setHoursError(e?.message ?? "Couldn't save your trading hours — please try again.");
    } finally {
      setHoursSaving(false);
    }
  };

  const MAX_PROMO_PHOTOS = 5;

  const pickPromoPhoto = async () => {
    if (promoPhotos.length >= MAX_PROMO_PHOTOS) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setPromoPhotos((prev) => [...prev, result.assets[0].uri]);
      setPromoError(null);
      setPromoSaved(false);
    }
  };

  const removePromoPhoto = (index: number) => {
    setPromoPhotos((prev) => prev.filter((_, i) => i !== index));
    setPromoSaved(false);
  };

  const handleSavePromo = async () => {
    if (promoPhotos.length === 0) {
      setPromoError('Add at least one photo to save your promo gallery.');
      return;
    }
    if (!session?.accessToken) {
      setPromoError("You're not signed in — please log in again.");
      return;
    }

    setPromoError(null);
    setPromoSaving(true);
    try {
      const hostedUrls: string[] = [];
      for (const uri of promoPhotos) {
        if (isHostedUrl(uri)) {
          hostedUrls.push(uri);
        } else {
          const uploaded = await uploadMedia(uri, session.accessToken);
          hostedUrls.push(uploaded.url);
        }
      }
      await putPromoPhotos(session.accessToken, hostedUrls);
      setPromoPhotos(hostedUrls);
      setPromoSaved(true);
    } catch (e: any) {
      setPromoError(e?.message ?? "Couldn't save your promo photos — please try again.");
    } finally {
      setPromoSaving(false);
    }
  };

  if (profileLoading) {
    return (
      <ScreenContainer className="items-center justify-center pt-6">
        <AppStatusBar />
        <ActivityIndicator color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (saved) {
    const selectedCategoryNames = categories
      .filter((c) => selectedCategoryIds.includes(c.id))
      .map((c) => c.name);

    return (
      <ScreenContainer scroll className="pt-6">
        <AppStatusBar />

        <View className="flex-row items-center gap-1.5 self-center rounded-full bg-verified/10 px-3 py-1">
          <Feather name="check-circle" size={12} color={colors.verified} />
          <Text className="text-xs font-semibold text-verified">Spaza profile live</Text>
        </View>

        <View className="mt-4 gap-3 rounded-2xl border border-border bg-card p-4">
          <View className="flex-row gap-3">
            <View>
              {imageUri ? (
                <Image source={{ uri: imageUri }} className="h-20 w-20 rounded-2xl" resizeMode="cover" />
              ) : (
                <View className="h-20 w-20 items-center justify-center rounded-2xl bg-muted">
                  <Feather name="shopping-bag" size={22} color={colors.mutedForeground} />
                </View>
              )}
              {isVerified && (
                <View className="absolute -bottom-1 -right-1 h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-verified">
                  <Feather name="check" size={11} color="#FFFFFF" />
                </View>
              )}
            </View>
            <View className="flex-1 justify-center gap-1">
              <View className="flex-row items-center gap-1.5">
                <Text className="flex-shrink text-base font-semibold text-foreground" numberOfLines={1}>
                  {businessName}
                </Text>
                {claimed && (
                  <View className="rounded-full bg-primary/10 px-2 py-0.5">
                    <Text className="text-[10px] font-semibold text-primary">Claimed</Text>
                  </View>
                )}
              </View>
              {reviewsCount > 0 ? (
                <View className="flex-row items-center gap-1">
                  <Feather name="star" size={12} color={colors.accent} />
                  <Text className="text-xs font-medium text-foreground">{rating.toFixed(1)}</Text>
                  <Text className="text-xs text-muted-foreground">({reviewsCount} reviews)</Text>
                </View>
              ) : (
                <Text className="text-xs text-muted-foreground">No reviews yet</Text>
              )}
              {!!description && (
                <Text className="text-sm text-muted-foreground" numberOfLines={2}>
                  {description}
                </Text>
              )}
            </View>
          </View>

          <View className="gap-2.5">
            {selectedCategoryNames.length > 0 && (
              <View className="flex-row flex-wrap gap-1.5">
                {selectedCategoryNames.map((name) => (
                  <View key={name} className="rounded-full bg-primary/10 px-2.5 py-1">
                    <Text className="text-xs font-medium text-primary">{name}</Text>
                  </View>
                ))}
              </View>
            )}

            <View className="gap-1.5 border-t border-border pt-2.5">
              <View className="flex-row items-center gap-2">
                <Feather name="map-pin" size={13} color={colors.mutedForeground} />
                <Text className="flex-1 text-sm text-muted-foreground">{locationDescription}</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Feather name="phone" size={13} color={colors.mutedForeground} />
                <Text className="text-sm text-muted-foreground">{contactPhone}</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="mb-1 mt-8 flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <Feather name="image" size={13} color={colors.mutedForeground} />
            <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Spaza Promo
            </Text>
          </View>
          <Text className="text-xs text-muted-foreground">{promoPhotos.length}/5 photos</Text>
        </View>
        <Text className="mb-3 text-sm text-muted-foreground">
          Add up to 5 photos customers can browse — your stock, storefront, specials, anything that
          shows off your spaza.
        </Text>

        <View className="gap-3 rounded-2xl border border-border bg-card p-4">
          <PromoPhotoGrid photos={promoPhotos} onAdd={pickPromoPhoto} onRemove={removePromoPhoto} />

          {!!promoError && <Text className="text-sm text-destructive">{promoError}</Text>}

          <View className="flex-row items-center justify-end gap-3">
            {promoSaved && !promoError && (
              <Text className="text-xs font-medium text-verified">Saved</Text>
            )}
            <Pressable
              onPress={handleSavePromo}
              disabled={promoSaving}
              className="flex-row items-center gap-1.5 rounded-full bg-primary px-4 py-2"
            >
              {promoSaving && <ActivityIndicator size="small" color={colors.primaryForeground} />}
              <Text className="text-xs font-semibold text-primary-foreground">
                {promoSaving ? 'Uploading…' : 'Save Promo Photos'}
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="mb-2 mt-8 flex-row items-center gap-1.5">
          <Feather name="clock" size={13} color={colors.mutedForeground} />
          <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Trading Hours
          </Text>
        </View>
        <Text className="mb-3 text-sm text-muted-foreground">
          Let customers know when you're open. Toggle a day off if you don't trade then.
        </Text>
        <TradingHoursEditor
          hours={tradingHours}
          onChange={(next) => {
            setTradingHours(next);
            setHoursSaved(false);
          }}
        />
        {!!hoursError && <Text className="mt-2 text-sm text-destructive">{hoursError}</Text>}
        <View className="mt-3 flex-row items-center justify-end gap-3">
          {hoursSaved && !hoursError && (
            <Text className="text-xs font-medium text-verified">Saved</Text>
          )}
          <Pressable
            onPress={handleSaveHours}
            disabled={hoursSaving}
            className="flex-row items-center gap-1.5 rounded-full bg-primary px-4 py-2"
          >
            {hoursSaving && <ActivityIndicator size="small" color={colors.primaryForeground} />}
            <Text className="text-xs font-semibold text-primary-foreground">Save Hours</Text>
          </Pressable>
        </View>

        <View className="mb-8 mt-8">
          <PrimaryButton label="Edit Spaza Details" onPress={() => setSaved(false)} variant="outline" />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll className="pt-6">
      <AppStatusBar />
      <Text className="text-2xl font-bold text-foreground">My Spaza</Text>
      <Text className="mt-1 text-sm text-muted-foreground">Set up your spaza's public profile</Text>

      <Pressable
        onPress={pickImage}
        className="mt-6 h-32 w-32 items-center justify-center self-center overflow-hidden rounded-2xl border border-dashed border-border bg-card"
      >
        {imageUri ? (
          <>
            <Image source={{ uri: imageUri }} className="h-full w-full" resizeMode="cover" />
            <View className="absolute bottom-1.5 right-1.5 h-7 w-7 items-center justify-center rounded-full bg-black/50">
              <Feather name="edit-2" size={13} color="#FFFFFF" />
            </View>
          </>
        ) : (
          <View className="items-center gap-1.5 px-2">
            <Feather name="camera" size={20} color={colors.mutedForeground} />
            <Text className="text-center text-xs font-medium text-muted-foreground">Add a photo</Text>
          </View>
        )}
      </Pressable>

      <View className="mt-5 gap-3.5">
        <TextField
          label="Business Name"
          icon="shopping-bag"
          placeholder="e.g. Thabo's Corner Shop"
          value={businessName}
          onChangeText={(v) => {
            setBusinessName(v);
            setFormError(null);
          }}
        />

        <TextField
          label="Description (optional)"
          placeholder="What do you sell? What makes your spaza special?"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <View>
          <Text className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Categories
          </Text>
          {categoriesLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : categoriesError ? (
            <Text className="text-sm text-destructive">{categoriesError}</Text>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {categories.map((category) => {
                const active = selectedCategoryIds.includes(category.id);
                return (
                  <Pressable
                    key={category.id}
                    onPress={() => toggleCategory(category.id)}
                    className={`rounded-full border px-3.5 py-2 ${
                      active ? 'border-primary bg-primary' : 'border-border bg-card'
                    }`}
                  >
                    <Text className={`text-xs font-medium ${active ? 'text-primary-foreground' : 'text-foreground'}`}>
                      {category.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <TextField
          label="Address"
          icon="map-pin"
          placeholder="e.g. 12 Vilakazi St, Soweto"
          value={locationDescription}
          onChangeText={(v) => {
            setLocationDescription(v);
            setFormError(null);
          }}
        />

        <View>
          <Text className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Map Location
          </Text>
          <Pressable
            onPress={() => navigation.navigate('MapPicker', coords ? { lat: coords.lat, lng: coords.lng } : undefined)}
            className="overflow-hidden rounded-xl border border-border bg-card"
          >
            {coords ? (
              <>
                <Image source={{ uri: staticMapUrl(coords.lat, coords.lng, colors.primary) }} className="h-28 w-full" resizeMode="cover" />
                <View className="flex-row items-center justify-between px-3.5 py-2.5">
                  <Text className="text-xs text-muted-foreground">
                    {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                  </Text>
                  <Text className="text-xs font-semibold text-primary">Change</Text>
                </View>
              </>
            ) : (
              <View className="flex-row items-center gap-2.5 px-3.5 py-3.5">
                <Feather name="map" size={16} color={colors.mutedForeground} />
                <Text className="flex-1 text-sm text-muted-foreground">Pin your spaza on the map</Text>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </View>
            )}
          </Pressable>
        </View>

        <TextField
          label="Contact Phone"
          icon="phone"
          keyboardType="phone-pad"
          placeholder="082 000 0000"
          value={contactPhone}
          onChangeText={(v) => {
            setContactPhone(v);
            setFormError(null);
          }}
        />

        {!!formError && <Text className="text-sm text-destructive">{formError}</Text>}

        <View className="mb-8 mt-2">
          <PrimaryButton label="Save Spaza" onPress={handleSave} loading={isSaving} />
        </View>
      </View>
    </ScreenContainer>
  );
}
