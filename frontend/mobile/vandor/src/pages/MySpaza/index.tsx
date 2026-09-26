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
import { getMyProfile, upsertMyProfile } from '../../api/vendors';
import { uploadNewImages } from '../../api/media';
import { ApiError } from '../../api/client';
import type { Category } from '../../types';
import type { MySpazaStackParamList } from '../../router/types';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
const MAX_PROMO_PHOTOS = 5;

function staticMapUrl(lat: number, lng: number, color: string) {
  const hex = color.replace('#', '0x');
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=640x260&scale=2&markers=color:${hex}%7C${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
}

export default function MySpazaScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MySpazaStackParamList>>();
  const route = useRoute<RouteProp<MySpazaStackParamList, 'MySpazaForm'>>();
  const { session } = useAuth();
  const colors = useThemeColors();
  const accessToken = session?.accessToken;

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

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

  const [tradingHours, setTradingHours] = useState<DayHours[]>(DEFAULT_TRADING_HOURS);
  const [promoPhotos, setPromoPhotos] = useState<string[]>([]);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSaved, setPromoSaved] = useState(false);
  const [isSavingPromo, setIsSavingPromo] = useState(false);

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

  // Pre-fills the form from the vendor's existing profile, if they already set one up -
  // otherwise this is a blank "first time" form.
  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    (async () => {
      try {
        const profile = await getMyProfile(accessToken);
        if (cancelled || !profile) return;

        setHasProfile(true);
        setBusinessName(profile.name);
        setDescription(profile.description ?? '');
        setLocationDescription(profile.locationDescription);
        setContactPhone(profile.phone ?? '');
        setImageUri(profile.image);
        setPromoPhotos(profile.photos);
        if (profile.latitude != null && profile.longitude != null) {
          setCoords({ lat: profile.latitude, lng: profile.longitude });
        }
        if (profile.tradingHours.length > 0) {
          // A closed day has null open/close times from the API - the editor still needs some
          // string to show if the vendor flips it back open, so default to a sensible 08:00-18:00.
          setTradingHours(
            profile.tradingHours.map((h) => ({
              day: h.day,
              isOpen: h.isOpen,
              openTime: h.openTime ?? '08:00',
              closeTime: h.closeTime ?? '18:00',
            }))
          );
        }
        setSelectedCategoryIds(
          categories.length > 0
            ? categories.filter((c) => profile.categories.includes(c.name)).map((c) => c.id)
            : []
        );
        setSaved(true);
      } catch {
        // Soft-fail - the vendor just sees a blank "set up your spaza" form instead.
      } finally {
        if (!cancelled) setIsLoadingProfile(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Waits for categories so profile.categories (names) can be matched back to ids.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, categories.length]);

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

  // Shared by both "Save Spaza" and "Save Promo Photos": the API takes the whole profile in one
  // PUT, so anything editable on this screen (categories, hours, both photo sets) gets sent
  // every time, not just the fields the button visually sits next to.
  const saveProfile = async () => {
    if (!accessToken) throw new ApiError('Your session has expired — please log in again.', 401);

    const [uploadedImage] = imageUri ? await uploadNewImages([imageUri], accessToken) : [null];
    const uploadedPromoPhotos = await uploadNewImages(promoPhotos, accessToken);

    const profile = await upsertMyProfile(
      {
        businessName: businessName.trim(),
        description: description.trim() || null,
        categoryIds: selectedCategoryIds,
        locationDescription: locationDescription.trim(),
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
        contactPhone: contactPhone.trim() || null,
        tradingHours,
        imageUrl: uploadedImage,
        photoUrls: uploadedPromoPhotos,
      },
      accessToken
    );

    // Reflect back whatever Cloudinary/the API actually stored (e.g. the uploaded URLs), so a
    // second save doesn't re-upload photos that are already hosted.
    setImageUri(profile.image);
    setPromoPhotos(profile.photos);
    setHasProfile(true);
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

    setIsSaving(true);
    try {
      await saveProfile();
      setSaved(true);
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : "Couldn't save your spaza. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

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
    setPromoError(null);
    setIsSavingPromo(true);
    try {
      await saveProfile();
      setPromoSaved(true);
    } catch (e) {
      setPromoError(e instanceof ApiError ? e.message : "Couldn't save your photos. Please try again.");
    } finally {
      setIsSavingPromo(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <ScreenContainer className="items-center justify-center">
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

        <View className="items-center">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-verified/10">
            <Feather name="check" size={24} color={colors.verified} />
          </View>
          <Text className="mt-4 text-xl font-semibold text-foreground">
            {hasProfile ? 'Your spaza profile' : 'Your spaza profile is ready'}
          </Text>
          <Text className="mt-1.5 text-center text-sm leading-5 text-muted-foreground">
            {hasProfile ? 'Customers can find you on Ngila.' : "You're now listed on Ngila."}
          </Text>
        </View>

        <Text className="mb-2 mt-8 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Spaza Summary
        </Text>
        <View className="gap-3 rounded-2xl border border-border bg-card p-4">
          <View className="flex-row gap-3">
            {imageUri ? (
              <Image source={{ uri: imageUri }} className="h-16 w-16 rounded-xl" resizeMode="cover" />
            ) : (
              <View className="h-16 w-16 items-center justify-center rounded-xl bg-muted">
                <Feather name="shopping-bag" size={20} color={colors.mutedForeground} />
              </View>
            )}
            <View className="flex-1 justify-center gap-1">
              <Text className="text-base font-semibold text-foreground">{businessName}</Text>
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
          <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Spaza Promo
          </Text>
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
              disabled={isSavingPromo}
              className="rounded-full bg-primary px-4 py-2 disabled:opacity-60"
            >
              <Text className="text-xs font-semibold text-primary-foreground">
                {isSavingPromo ? 'Saving…' : 'Save Promo Photos'}
              </Text>
            </Pressable>
          </View>
        </View>

        <Text className="mb-2 mt-8 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Trading Hours
        </Text>
        <Text className="mb-3 text-sm text-muted-foreground">
          Let customers know when you're open. Toggle a day off if you don't trade then. Changes
          here are saved along with your promo photos above.
        </Text>
        <TradingHoursEditor hours={tradingHours} onChange={setTradingHours} />

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
