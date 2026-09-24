import {
    BadgeCheck,
    Clock3,
    MapPin,
    Phone,
    Star,
    X,
} from "lucide-react-native";
import {
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Vendor } from "../constants/vendor";
import { Theme } from "../constants/theme";

type VendorDetailSheetProps = {
    vendor: Vendor | null;
    visible: boolean;
    theme: Theme;
    onClose: () => void;
    onDirections: () => void;
    onRate: () => void;
};

export default function VendorDetailSheet({
    vendor,
    visible,
    theme,
    onClose,
    onDirections,
    onRate,
}: VendorDetailSheetProps) {
    if (!vendor) {
        return null;
    }

    const distance =
        vendor.distance < 1000
            ? `${vendor.distance} m`
            : `${(vendor.distance / 1000).toFixed(1)} km`;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View
                style={[
                    styles.overlay,
                    {
                        backgroundColor: theme.colors.overlay,
                    },
                ]}
            >
                <Pressable
                    style={styles.dismissArea}
                    onPress={onClose}
                />

                <View
                    style={[
                        styles.sheet,
                        {
                            backgroundColor:
                                theme.colors.background,
                        },
                    ]}
                >
                    <View style={styles.handle} />

                    <View style={styles.topRow}>
                        <View
                            style={[
                                styles.categoryBadge,
                                {
                                    backgroundColor:
                                        theme.colors.secondary,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.categoryText,
                                    {
                                        color:
                                            theme.colors
                                                .secondaryForeground,
                                    },
                                ]}
                            >
                                {vendor.category}
                            </Text>
                        </View>

                        <Pressable
                            onPress={onClose}
                            style={[
                                styles.closeButton,
                                {
                                    backgroundColor:
                                        theme.colors.secondary,
                                },
                            ]}
                        >
                            <X
                                size={17}
                                strokeWidth={2.2}
                                color={
                                    theme.colors.foreground
                                }
                            />
                        </Pressable>
                    </View>

                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: vendor.image }}
                            style={styles.image}
                        />

                        <View
                            style={[
                                styles.ratingBadge,
                                {
                                    backgroundColor:
                                        theme.colors.card,
                                },
                            ]}
                        >
                            <Star
                                size={12}
                                strokeWidth={2}
                                fill={theme.colors.accent}
                                color={theme.colors.accent}
                            />

                            <Text
                                style={[
                                    styles.rating,
                                    {
                                        color:
                                            theme.colors
                                                .foreground,
                                    },
                                ]}
                            >
                                {vendor.rating}
                            </Text>

                            <Text
                                style={[
                                    styles.reviewCount,
                                    {
                                        color:
                                            theme.colors
                                                .mutedForeground,
                                    },
                                ]}
                            >
                                ({vendor.reviewsCount})
                            </Text>
                        </View>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.nameRow}>
                            <Text
                                style={[
                                    styles.name,
                                    {
                                        color:
                                            theme.colors.foreground,
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
                                                theme.colors
                                                    .verified,
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
                            style={[
                                styles.description,
                                {
                                    color:
                                        theme.colors
                                            .mutedForeground,
                                },
                            ]}
                        >
                            {vendor.description}
                        </Text>

                        <View style={styles.infoRow}>
                            <MapPin
                                size={18}
                                strokeWidth={2}
                                color={
                                    theme.colors
                                        .mutedForeground
                                }
                                style={styles.infoIcon}
                            />

                            <View style={styles.infoContent}>
                                <Text
                                    style={[
                                        styles.infoText,
                                        {
                                            color:
                                                theme.colors
                                                    .foreground,
                                        },
                                    ]}
                                >
                                    {vendor.location}
                                </Text>

                                <Text
                                    style={[
                                        styles.infoSubtext,
                                        {
                                            color:
                                                theme.colors
                                                    .mutedForeground,
                                        },
                                    ]}
                                >
                                    {distance} away
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <Clock3
                                size={18}
                                strokeWidth={2}
                                color={
                                    theme.colors
                                        .mutedForeground
                                }
                                style={styles.infoIcon}
                            />

                            <View style={styles.infoContent}>
                                <Text
                                    style={[
                                        styles.infoText,
                                        {
                                            color:
                                                vendor.isOpen
                                                    ? theme.colors
                                                          .success
                                                    : theme.colors
                                                          .mutedForeground,
                                        },
                                    ]}
                                >
                                    {vendor.isOpen
                                        ? "Open now"
                                        : "Closed"}
                                </Text>

                                <Text
                                    style={[
                                        styles.infoSubtext,
                                        {
                                            color:
                                                theme.colors
                                                    .mutedForeground,
                                        },
                                    ]}
                                >
                                    {vendor.hours}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <Phone
                                size={18}
                                strokeWidth={2}
                                color={
                                    theme.colors
                                        .mutedForeground
                                }
                                style={styles.infoIcon}
                            />

                            <View style={styles.infoContent}>
                                <Text
                                    style={[
                                        styles.infoText,
                                        {
                                            color:
                                                theme.colors
                                                    .foreground,
                                        },
                                    ]}
                                >
                                    {vendor.phone}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.buttonRow}>
                            <Pressable
                                onPress={onDirections}
                                style={[
                                    styles.primaryButton,
                                    {
                                        backgroundColor:
                                            theme.colors.primary,
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.primaryButtonText,
                                        {
                                            color:
                                                theme.colors
                                                    .primaryForeground,
                                        },
                                    ]}
                                >
                                    Get Directions
                                </Text>
                            </Pressable>

                            <Pressable
                                onPress={onRate}
                                style={[
                                    styles.secondaryButton,
                                    {
                                        backgroundColor:
                                            theme.colors.secondary,
                                        borderColor:
                                            theme.colors.border,
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.secondaryButtonText,
                                        {
                                            color:
                                                theme.colors
                                                    .foreground,
                                        },
                                    ]}
                                >
                                    Rate Vendor
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
    },

    dismissArea: {
        flex: 1,
    },

    sheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 10,
        paddingBottom: 28,
        maxHeight: "88%",
    },

    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#D4D4D8",
        alignSelf: "center",
        marginBottom: 14,
    },

    topRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        marginBottom: 12,
    },

    categoryBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
    },

    categoryText: {
        fontSize: 11,
        fontWeight: "600",
    },

    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },

    imageContainer: {
        position: "relative",
        paddingHorizontal: 16,
    },

    image: {
        width: "100%",
        height: 190,
        borderRadius: 14,
    },

    ratingBadge: {
        position: "absolute",
        right: 26,
        bottom: 10,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 9,
        paddingVertical: 6,
        borderRadius: 999,
    },

    rating: {
        fontSize: 12,
        fontWeight: "700",
        marginLeft: 4,
    },

    reviewCount: {
        fontSize: 10,
        marginLeft: 3,
    },

    content: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },

    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 7,
    },

    name: {
        flex: 1,
        fontSize: 21,
        fontWeight: "700",
    },

    verifiedBadge: {
        width: 19,
        height: 19,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 7,
    },

    description: {
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 16,
    },

    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 13,
    },

    infoIcon: {
        width: 30,
        marginRight: 7,
    },

    infoContent: {
        flex: 1,
    },

    infoText: {
        fontSize: 13,
        fontWeight: "500",
    },

    infoSubtext: {
        fontSize: 11,
        marginTop: 2,
    },

    buttonRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 8,
    },

    primaryButton: {
        flex: 1,
        height: 46,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },

    primaryButtonText: {
        fontSize: 13,
        fontWeight: "600",
    },

    secondaryButton: {
        flex: 1,
        height: 46,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    secondaryButtonText: {
        fontSize: 13,
        fontWeight: "600",
    },
});