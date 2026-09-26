import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { Theme } from "../constants/theme";
import { categories } from "../constants/vendor";
import { Vendor } from "../types/vendor";

const GOOGLE_MAPS_API_KEY =
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

// Johannesburg CBD - matches the default center used elsewhere (e.g. the vendor
// app's location picker) when there's nothing more specific to centre on yet.
const DEFAULT_CENTER = { lat: -26.2041, lng: 28.0473 };

const PIN_COLORS = [
    "#C86F3F",
    "#5A9B7A",
    "#D99A3D",
    "#8A5B7A",
    "#3D6B8A",
    "#A34D4D",
    "#4D8A6F",
];

function colorForCategory(vendorCategories: string[]): string {
    const firstCategory = vendorCategories[0];
    const index = firstCategory ? categories.indexOf(firstCategory) : -1;
    return PIN_COLORS[index < 0 ? 0 : index % PIN_COLORS.length]!;
}

export type RouteInfo = {
    distanceText: string;
    durationText: string;
    isEstimate: boolean;
};

export type VendorMapHandle = {
    /** Re-centres and re-fits the map to whatever vendors/route it currently has. */
    refit: () => void;
};

type VendorMapProps = {
    theme: Theme;
    vendors: Vendor[];
    userLocation?: { latitude: number; longitude: number } | null;
    /** When set alongside userLocation, draws a route from the user to this vendor. */
    routeTo?: Vendor | null;
    onVendorPress?: (vendorId: string) => void;
    onRouteInfo?: (info: RouteInfo | null) => void;
};

// A single WebView + Google Maps JS instance shared by the "all vendors" map (Discover
// screen's map toggle) and the single-vendor directions view - which pins/route it draws
// is driven entirely by props, updated via injectJavaScript rather than reloading the
// page, so the map doesn't flicker/reinitialise on every filter keystroke.
const VendorMap = forwardRef<VendorMapHandle, VendorMapProps>(function VendorMap(
    { theme, vendors, userLocation, routeTo, onVendorPress, onRouteInfo },
    ref,
) {
    const webviewRef = useRef<WebView>(null);
    const readyRef = useRef(false);

    const html = useMemo(() => buildMapHtml(theme.colors.primary), [theme.colors.primary]);

    const run = (script: string) => {
        if (!readyRef.current) return;
        webviewRef.current?.injectJavaScript(`${script}; true;`);
    };

    // Only vendors with a real pin can be plotted - some haven't set an exact location yet.
    const pinned = useMemo(
        () =>
            vendors.filter(
                (v): v is Vendor & { latitude: number; longitude: number } =>
                    v.latitude != null && v.longitude != null,
            ),
        [vendors],
    );

    const routeToPinned =
        routeTo && routeTo.latitude != null && routeTo.longitude != null
            ? { latitude: routeTo.latitude, longitude: routeTo.longitude }
            : null;

    useImperativeHandle(ref, () => ({
        refit: () => run("window.fitToMarkers && window.fitToMarkers()"),
    }));

    const vendorPayload = () =>
        JSON.stringify(
            pinned.map((v) => ({
                id: v.id,
                latitude: v.latitude,
                longitude: v.longitude,
                title: v.name,
                color: colorForCategory(v.categories),
            })),
        );

    useEffect(() => {
        run(`window.setVendors(${vendorPayload()})`);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pinned]);

    useEffect(() => {
        if (userLocation) {
            run(`window.setUserLocation(${userLocation.latitude}, ${userLocation.longitude})`);
        } else {
            run("window.clearUserLocation()");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userLocation]);

    useEffect(() => {
        if (userLocation && routeToPinned) {
            run(
                `window.showRoute(${userLocation.latitude}, ${userLocation.longitude}, ${routeToPinned.latitude}, ${routeToPinned.longitude})`,
            );
        } else {
            run("window.clearRoute()");
            onRouteInfo?.(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userLocation, routeToPinned]);

    const handleMessage = (event: WebViewMessageEvent) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);

            if (data.type === "ready") {
                readyRef.current = true;
                run(`window.setVendors(${vendorPayload()})`);
                if (userLocation) {
                    run(`window.setUserLocation(${userLocation.latitude}, ${userLocation.longitude})`);
                }
                if (userLocation && routeToPinned) {
                    run(
                        `window.showRoute(${userLocation.latitude}, ${userLocation.longitude}, ${routeToPinned.latitude}, ${routeToPinned.longitude})`,
                    );
                }
                return;
            }

            if (data.type === "vendorPress") {
                onVendorPress?.(data.id);
                return;
            }

            if (data.type === "routeInfo") {
                onRouteInfo?.({
                    distanceText: data.distanceText,
                    durationText: data.durationText,
                    isEstimate: Boolean(data.isEstimate),
                });
                return;
            }
        } catch {
            // ignore malformed messages
        }
    };

    if (!GOOGLE_MAPS_API_KEY) {
        return (
            <View
                style={[
                    styles.container,
                    styles.missingKey,
                    { backgroundColor: theme.colors.secondary },
                ]}
            >
                <Text style={{ color: theme.colors.mutedForeground, fontSize: 12, textAlign: "center" }}>
                    EXPO_PUBLIC_GOOGLE_MAPS_API_KEY isn't set, so the map can't load.
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <WebView
                ref={webviewRef}
                originWhitelist={["*"]}
                source={{ html }}
                onMessage={handleMessage}
                style={styles.webview}
            />
        </View>
    );
});

export default VendorMap;

function buildMapHtml(primaryColor: string) {
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
      var map;
      var vendorMarkers = [];
      var userMarker = null;
      var routeLine = null;
      var directionsService, directionsRenderer;

      function notify(payload) {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      }

      function clearVendorMarkers() {
        vendorMarkers.forEach(function (m) { m.setMap(null); });
        vendorMarkers = [];
      }

      window.setVendors = function (vendors) {
        clearVendorMarkers();
        vendors.forEach(function (v) {
          var marker = new google.maps.Marker({
            position: { lat: v.latitude, lng: v.longitude },
            map: map,
            title: v.title,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 9,
              fillColor: v.color,
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
          });
          marker.addListener('click', function () { notify({ type: 'vendorPress', id: v.id }); });
          vendorMarkers.push(marker);
        });
        window.fitToMarkers();
      };

      window.fitToMarkers = function () {
        if (vendorMarkers.length === 0) return;
        var bounds = new google.maps.LatLngBounds();
        vendorMarkers.forEach(function (m) { bounds.extend(m.getPosition()); });
        if (userMarker) bounds.extend(userMarker.getPosition());
        map.fitBounds(bounds, 60);
      };

      window.setUserLocation = function (lat, lng) {
        var pos = { lat: lat, lng: lng };
        if (userMarker) {
          userMarker.setPosition(pos);
        } else {
          userMarker = new google.maps.Marker({
            position: pos,
            map: map,
            title: 'Your location',
            zIndex: 999,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#3D6B8A',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            },
          });
        }
      };

      window.clearUserLocation = function () {
        if (userMarker) { userMarker.setMap(null); userMarker = null; }
      };

      window.clearRoute = function () {
        if (directionsRenderer) directionsRenderer.set('directions', null);
        if (routeLine) { routeLine.setMap(null); routeLine = null; }
      };

      function drawStraightLine(oLat, oLng, dLat, dLng) {
        if (routeLine) routeLine.setMap(null);
        routeLine = new google.maps.Polyline({
          path: [{ lat: oLat, lng: oLng }, { lat: dLat, lng: dLng }],
          strokeColor: '${primaryColor}',
          strokeOpacity: 0.9,
          strokeWeight: 3,
          icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 }, offset: '0', repeat: '14px' }],
        });
        routeLine.setMap(map);

        var bounds = new google.maps.LatLngBounds();
        bounds.extend({ lat: oLat, lng: oLng });
        bounds.extend({ lat: dLat, lng: dLng });
        map.fitBounds(bounds, 80);

        var R = 6371;
        var dLat2 = (dLat - oLat) * Math.PI / 180;
        var dLng2 = (dLng - oLng) * Math.PI / 180;
        var a = Math.sin(dLat2 / 2) * Math.sin(dLat2 / 2) +
          Math.cos(oLat * Math.PI / 180) * Math.cos(dLat * Math.PI / 180) *
          Math.sin(dLng2 / 2) * Math.sin(dLng2 / 2);
        var distanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        notify({
          type: 'routeInfo',
          distanceText: distanceKm < 1 ? Math.round(distanceKm * 1000) + ' m' : distanceKm.toFixed(1) + ' km',
          durationText: 'estimate',
          isEstimate: true,
        });
      }

      window.showRoute = function (oLat, oLng, dLat, dLng) {
        if (routeLine) { routeLine.setMap(null); routeLine = null; }
        directionsService.route({
          origin: { lat: oLat, lng: oLng },
          destination: { lat: dLat, lng: dLng },
          travelMode: google.maps.TravelMode.DRIVING,
        }, function (result, status) {
          if (status === 'OK' && result.routes[0]) {
            directionsRenderer.setDirections(result);
            var leg = result.routes[0].legs[0];
            notify({
              type: 'routeInfo',
              distanceText: leg.distance.text,
              durationText: leg.duration.text,
              isEstimate: false,
            });
          } else {
            if (directionsRenderer) directionsRenderer.set('directions', null);
            drawStraightLine(oLat, oLng, dLat, dLng);
          }
        });
      };

      function init() {
        map = new google.maps.Map(document.getElementById('map'), {
          center: { lat: ${DEFAULT_CENTER.lat}, lng: ${DEFAULT_CENTER.lng} },
          zoom: 13,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'greedy',
        });
        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer({
          suppressMarkers: true,
          polylineOptions: { strokeColor: '${primaryColor}', strokeWeight: 4 },
        });
        directionsRenderer.setMap(map);
        notify({ type: 'ready' });
      }

      init();
    </script>
  </body>
</html>`;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: "hidden",
    },
    webview: {
        flex: 1,
    },
    missingKey: {
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
});
