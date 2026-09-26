import {
    MapPin,
    Search,
    X,
    Map,
    RefreshCw,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import {
    categories,
    distanceOptions,
    vendors,
} from "../../constants/vendor";
import { Theme } from "../../constants/theme";
import { useLocationContext } from "../../context/LocationContext";
import CategoryPill from "../../components/CategoryPill";
import FilterChip from "../../components/FilterChip";
import VendorCard from "../../components/VendorCard";

type DiscoverScreenProps = {
    theme: Theme;
    onVendorPress: (vendorId: number) => void;
};

export default function DiscoverScreen({
    theme,
    onVendorPress,
}: DiscoverScreenProps) {
    const [selectedCategory, setSelectedCategory] =
        useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDistance, setSelectedDistance] =
        useState("10 km");
    const [openNow, setOpenNow] = useState(false);
    const [highRating, setHighRating] = useState(false);

    const {
        location,
        loading,
        retryLocation,
    } = useLocationContext();

    const locationText = loading
        ? "Locating..."
        : location?.address.suburb &&
          location?.address.city
        ? `${location.address.suburb}, ${location.address.city}`
        : location?.address.city
        ? location.address.city
        : "Location unavailable";

    const filteredVendors = useMemo(() => {
        const distanceInMetres =
            selectedDistance === "500 m"
                ? 500
                : selectedDistance === "1 km"
                  ? 1000
                  : 10000;

        return vendors.filter((vendor) => {
            const matchesCategory =
                selectedCategory === "All" ||
                vendor.category === selectedCategory;

            const query = searchQuery.trim().toLowerCase();

            const matchesSearch =
                query.length === 0 ||
                vendor.name.toLowerCase().includes(query) ||
                vendor.category.toLowerCase().includes(query) ||
                vendor.description
                    .toLowerCase()
                    .includes(query);

            const matchesDistance =
                vendor.distance <= distanceInMetres;

            const matchesOpen =
                !openNow || vendor.isOpen;

            const matchesRating =
                !highRating || vendor.rating >= 4.5;

            return (
                matchesCategory &&
                matchesSearch &&
                matchesDistance &&
                matchesOpen &&
                matchesRating
            );
        });
    }, [
        selectedCategory,
        searchQuery,
        selectedDistance,
        openNow,
        highRating,
    ]);

    return (
        <ScrollView
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.background,
                },
            ]}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <Pressable
                onPress={retryLocation}
                disabled={loading}
                style={({ pressed }) => [
                    styles.locationRow,
                    {
                        opacity: loading
                            ? 0.6
                            : pressed
                            ? 0.7
                            : 1,
                    },
                ]}
            >
                <MapPin
                    size={22}
                    strokeWidth={2}
                    color={theme.colors.foreground}
                    style={styles.locationIcon}
                />

                <View style={styles.locationContent}>
                    <Text
                        style={[
                            styles.locationLabel,
                            {
                                color:
                                    theme.colors
                                        .mutedForeground,
                            },
                        ]}
                    >
                        Your current location
                    </Text>

                    <Text
                        style={[
                            styles.location,
                            {
                                color: theme.colors.foreground,
                            },
                        ]}
                    >
                        {locationText}
                    </Text>
                </View>

                <RefreshCw
                    size={17}
                    strokeWidth={2}
                    color={theme.colors.mutedForeground}
                />
            </Pressable>

            <Text
                style={[
                    styles.title,
                    {
                        color: theme.colors.foreground,
                    },
                ]}
            >
                What are you looking for?
            </Text>

            <View
                style={[
                    styles.searchContainer,
                    {
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border,
                    },
                ]}
            >
                <Search
                    size={19}
                    strokeWidth={2}
                    color={theme.colors.mutedForeground}
                    style={styles.searchIcon}
                />

                <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search vendors, products..."
                    placeholderTextColor={
                        theme.colors.mutedForeground
                    }
                    style={[
                        styles.searchInput,
                        {
                            color: theme.colors.foreground,
                        },
                    ]}
                    returnKeyType="search"
                />

                {searchQuery.length > 0 && (
                    <Pressable
                        onPress={() => setSearchQuery("")}
                        style={styles.clearButton}
                    >
                        <X
                            size={18}
                            strokeWidth={2}
                            color={
                                theme.colors
                                    .mutedForeground
                            }
                        />
                    </Pressable>
                )}
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categories}
                contentContainerStyle={styles.categoryContent}
            >
                {categories.map((category) => (
                    <CategoryPill
                        key={category}
                        label={category}
                        selected={
                            selectedCategory === category
                        }
                        theme={theme}
                        onPress={() =>
                            setSelectedCategory(category)
                        }
                    />
                ))}
            </ScrollView>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filters}
                contentContainerStyle={styles.filterContent}
            >
                <FilterChip
                    label="Filters"
                    selected={false}
                    theme={theme}
                    onPress={() => {}}
                />

                {distanceOptions.map((distance) => (
                    <FilterChip
                        key={distance}
                        label={distance}
                        selected={
                            selectedDistance === distance
                        }
                        theme={theme}
                        onPress={() =>
                            setSelectedDistance(distance)
                        }
                    />
                ))}

                <FilterChip
                    label="Open now"
                    selected={openNow}
                    theme={theme}
                    onPress={() => setOpenNow(!openNow)}
                />

                <FilterChip
                    label="4.5+ rating"
                    selected={highRating}
                    theme={theme}
                    onPress={() =>
                        setHighRating(!highRating)
                    }
                />
            </ScrollView>

            <View style={styles.resultsHeader}>
                <Text
                    style={[
                        styles.resultsCount,
                        {
                            color: theme.colors.foreground,
                        },
                    ]}
                >
                    {filteredVendors.length}{" "}
                    {filteredVendors.length === 1
                        ? "vendor"
                        : "vendors"}{" "}
                    found
                </Text>

                <Pressable
                    style={({ pressed }) => [
                        styles.mapButton,
                        {
                            borderColor: theme.colors.border,
                            backgroundColor: theme.colors.card,
                            opacity: pressed ? 0.7 : 1,
                        },
                    ]}
                >
                    <Map
                        size={15}
                        strokeWidth={2}
                        color={theme.colors.foreground}
                    />

                    <Text
                        style={[
                            styles.mapButtonText,
                            {
                                color: theme.colors.foreground,
                            },
                        ]}
                    >
                        Toggle Map
                    </Text>
                </Pressable>
            </View>

            {filteredVendors.length > 0 ? (
                filteredVendors.map((vendor) => (
                    <VendorCard
                        key={vendor.id}
                        vendor={vendor}
                        theme={theme}
                        onPress={() =>
                            onVendorPress(vendor.id)
                        }
                    />
                ))
            ) : (
                <View
                    style={[
                        styles.emptyState,
                        {
                            backgroundColor:
                                theme.colors.card,
                            borderColor:
                                theme.colors.border,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.emptyTitle,
                            {
                                color:
                                    theme.colors.foreground,
                            },
                        ]}
                    >
                        No vendors found
                    </Text>

                    <Text
                        style={[
                            styles.emptyDescription,
                            {
                                color:
                                    theme.colors
                                        .mutedForeground,
                            },
                        ]}
                    >
                        Try changing your search or filters.
                    </Text>
                </View>
            )}

            <View style={styles.bottomSpacing} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    content: {
        padding: 16,
        paddingBottom: 24,
    },

    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 22,
    },

    locationIcon: {
        marginRight: 9,
    },

    locationContent: {
        flex: 1,
    },

    locationLabel: {
        fontSize: 10,
        marginBottom: 2,
    },

    location: {
        fontSize: 13,
        fontWeight: "600",
    },

    title: {
        fontSize: 23,
        fontWeight: "800",
        marginBottom: 14,
    },

    searchContainer: {
        height: 46,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 11,
        paddingHorizontal: 12,
        marginBottom: 14,
    },

    searchIcon: {
        marginRight: 8,
    },

    searchInput: {
        flex: 1,
        height: "100%",
        fontSize: 13,
    },

    clearButton: {
        width: 28,
        height: 28,
        alignItems: "center",
        justifyContent: "center",
    },

    categories: {
        marginHorizontal: -16,
        marginBottom: 12,
    },

    categoryContent: {
        paddingHorizontal: 16,
    },

    filters: {
        marginHorizontal: -16,
        marginBottom: 20,
    },

    filterContent: {
        paddingHorizontal: 16,
    },

    resultsHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },

    resultsCount: {
        fontSize: 14,
        fontWeight: "600",
    },

    mapButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 7,
    },

    mapButtonText: {
        fontSize: 11,
        fontWeight: "500",
    },

    emptyState: {
        borderWidth: 1,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
        paddingHorizontal: 20,
    },

    emptyTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 6,
    },

    emptyDescription: {
        fontSize: 12,
        textAlign: "center",
    },

    bottomSpacing: {
        height: 20,
    },
});