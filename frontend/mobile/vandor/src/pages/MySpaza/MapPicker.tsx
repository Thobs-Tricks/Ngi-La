import React, { useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import * as Location from 'expo-location';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppStatusBar from '../../components/AppStatusBar';
import PrimaryButton from '../../components/PrimaryButton';
import { useThemeColors } from '../../styles/theme';
import type { MySpazaStackParamList } from '../../router/types';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
// Johannesburg — a sensible default center until a real pin or GPS fix comes in.
const DEFAULT_CENTER = { lat: -26.2041, lng: 28.0473 };

function buildMapHtml(lat: number, lng: number, markerColor: string) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <style>html, body, #map { height: 100%; margin: 0; padding: 0; }</style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}"></script>
    <script>
      var map, marker;

      function notify(pos) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ lat: pos.lat(), lng: pos.lng() }));
      }

      function init() {
        var center = { lat: ${lat}, lng: ${lng} };
        map = new google.maps.Map(document.getElementById('map'), {
          center: center,
          zoom: 15,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'greedy',
        });
        marker = new google.maps.Marker({
          position: center,
          map: map,
          draggable: true,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: '${markerColor}',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          },
        });
        marker.addListener('dragend', function () { notify(marker.getPosition()); });
        map.addListener('click', function (e) {
          marker.setPosition(e.latLng);
          notify(e.latLng);
        });
      }

      window.setMarkerPosition = function (lat, lng) {
        var pos = { lat: lat, lng: lng };
        if (marker && map) {
          marker.setPosition(pos);
          map.panTo(pos);
          notify(marker.getPosition());
        }
      };

      init();
    </script>
  </body>
</html>`;
}

export default function MapPickerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MySpazaStackParamList>>();
  const route = useRoute<RouteProp<MySpazaStackParamList, 'MapPicker'>>();
  const colors = useThemeColors();
  const webviewRef = useRef<WebView>(null);

  const initial = useMemo(
    () => ({
      lat: route.params?.lat ?? DEFAULT_CENTER.lat,
      lng: route.params?.lng ?? DEFAULT_CENTER.lng,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const html = useMemo(() => buildMapHtml(initial.lat, initial.lng, colors.primary), [initial, colors.primary]);

  const [picked, setPicked] = useState(initial);
  const [locating, setLocating] = useState(false);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (typeof data.lat === 'number' && typeof data.lng === 'number') {
        setPicked({ lat: data.lat, lng: data.lng });
      }
    } catch {
      // ignore malformed messages
    }
  };

  const useMyLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const position = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = position.coords;
      webviewRef.current?.injectJavaScript(`window.setMarkerPosition(${latitude}, ${longitude}); true;`);
      setPicked({ lat: latitude, lng: longitude });
    } catch {
      // soft-fail — the pin just stays where it was
    } finally {
      setLocating(false);
    }
  };

  const confirm = () => {
    navigation.navigate('MySpazaForm', { lat: picked.lat, lng: picked.lng });
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right', 'bottom']}>
      <AppStatusBar />
      <View className="flex-row items-center justify-between px-4 py-2">
        <Pressable onPress={() => navigation.goBack()} className="h-9 w-9 items-center justify-center">
          <Feather name="x" size={20} color={colors.foreground} />
        </Pressable>
        <Text className="text-base font-semibold text-foreground">Pin Your Location</Text>
        <View className="h-9 w-9" />
      </View>

      <View className="flex-1 overflow-hidden">
        <WebView
          ref={webviewRef}
          originWhitelist={['*']}
          source={{ html }}
          onMessage={handleMessage}
          style={{ flex: 1 }}
        />
      </View>

      <View className="gap-3 border-t border-border bg-card px-6 pb-2 pt-4">
        <Pressable onPress={useMyLocation} className="flex-row items-center justify-center gap-2 py-1">
          <Feather name="crosshair" size={15} color={colors.primary} />
          <Text className="text-sm font-semibold text-primary">
            {locating ? 'Locating…' : 'Use my current location'}
          </Text>
        </Pressable>
        <Text className="text-center text-xs text-muted-foreground">
          {picked.lat.toFixed(5)}, {picked.lng.toFixed(5)}
        </Text>
        <PrimaryButton label="Confirm Location" onPress={confirm} />
      </View>
    </SafeAreaView>
  );
}
