import {
    BadgeCheck,
    Star,
} from "lucide-react-native";
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Theme } from "../constants/theme";
import { Vendor } from "../types/vendor";

type VendorCardProps = {
    vendor: Vendor;
    theme: Theme;
    onPress: () => void;
};

export default function VendorCard({
    vendor,
    theme,
    onPress,
}: VendorCardProps) {
    const distance =
        vendor.distance < 1000
            ? `${vendor.distance} m`
            : `${(vendor.distance / 1000).toFixed(1)} km`;

    const category =
        vendor.categories.length > 0
            ? vendor.categories.join(" • ")
            : "Uncategorized";

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.container,
                {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                    opacity: pressed ? 0.85 : 1,
                },
            ]}
        >
            {vendor.image ? (
                <Image
                    source={{ uri: vendor.image }}
                    style={styles.image}
                />
            ) : (
                <View
                    style={[
                        styles.image,
                        styles.imagePlaceholder,
                        {
                            backgroundColor:
                                theme.colors.muted,
                        },
                    ]}
                >
                    <MapPinPlaceholder
                        color={theme.colors.mutedForeground}
                    />
                </View>
            )}

            <View style={styles.content}>
                <View style={styles.titleRow}>
                    <Text
                        numberOfLines={1}
                        style={[
                            styles.name,
                            {
                                color: theme.colors.foreground,
                            },
                        ]}
                    >
                        {vendor.name}
                    </Text>

                    {vendor.isVerified && (
                        <View
                            style={[
                                styles.verifiedBadge,
                                {
                                    backgroundColor:
                                        theme.colors.verified,
                                },
                            ]}
                        >
                            <BadgeCheck
                                size={13}
                                strokeWidth={2.2}
                                color={
                                    theme.colors
                                        .verifiedForeground
                                }
                            />
                        </View>
                    )}
                </View>

                <Text
                    numberOfLines={1}
                    style={[
                        styles.category,
                        {
                            color: theme.colors
                                .mutedForeground,
                        },
                    ]}
                >
                    {category}
                </Text>

                <View style={styles.detailsRow}>
                    <Text
                        style={[
                            styles.detail,
                            {
                                color: theme.colors
                                    .mutedForeground,
                            },
                        ]}
                    >
                        {distance}
                    </Text>

                    <Text
                        style={[
                            styles.separator,
                            {
                                color: theme.colors.border,
                            },
                        ]}
                    >
                        •
                    </Text>

                    <View style={styles.ratingContainer}>
                        <Star
                            size={11}
                            strokeWidth={2}
                            fill={theme.colors.accent}
                            color={theme.colors.accent}
                        />

                        <Text
                            style={[
                                styles.rating,
                                {
                                    color: theme.colors
                                        .foreground,
                                },
                            ]}
                        >
                            {vendor.rating}
                        </Text>
                    </View>

                    <Text
                        style={[
                            styles.reviews,
                            {
                                color: theme.colors
                                    .mutedForeground,
                            },
                        ]}
                    >
                        ({vendor.reviewsCount})
                    </Text>
                </View>

                <View style={styles.statusRow}>
                    <View
                        style={[
                            styles.statusDot,
                            {
                                backgroundColor:
                                    vendor.isOpen
                                        ? theme.colors
                                              .success
                                        : theme.colors
                                              .mutedForeground,
                            },
                        ]}
                    />

                    <Text
                        style={[
                            styles.status,
                            {
                                color: vendor.isOpen
                                    ? theme.colors.success
                                    : theme.colors
                                          .mutedForeground,
                            },
                        ]}
                    >
                        {vendor.isOpen
                            ? "Open now"
                            : "Closed"}
                    </Text>
                </View>
            </View>
        </Pressable>
    );
}

function MapPinPlaceholder({
    color,
}: {
    color: string;
}) {
    return (
        <View
            style={[
                styles.placeholderIcon,
                {
                    borderColor: color,
                },
            ]}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        borderWidth: 1,
        borderRadius: 14,
        padding: 10,
        marginBottom: 12,
    },

    image: {
        width: 88,
        height: 88,
        borderRadius: 10,
    },

    imagePlaceholder: {
        alignItems: "center",
        justifyContent: "center",
    },

    placeholderIcon: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderRadius: 10,
    },

    content: {
        flex: 1,
        paddingLeft: 12,
        justifyContent: "center",
    },

    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 3,
    },

    name: {
        flex: 1,
        fontSize: 15,
        fontWeight: "700",
    },

    verifiedBadge: {
        width: 17,
        height: 17,
        borderRadius: 8.5,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 6,
    },

    category: {
        fontSize: 12,
        marginBottom: 7,
    },

    detailsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 7,
    },

    detail: {
        fontSize: 11,
    },

    separator: {
        fontSize: 11,
        marginHorizontal: 5,
    },

    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },

    rating: {
        fontSize: 11,
        fontWeight: "600",
    },

    reviews: {
        fontSize: 11,
        marginLeft: 2,
    },

    statusRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 5,
    },

    status: {
        fontSize: 11,
        fontWeight: "500",
    },
});