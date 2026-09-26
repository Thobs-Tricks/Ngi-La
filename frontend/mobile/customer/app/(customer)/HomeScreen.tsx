import {
    ArrowRight,
} from "lucide-react-native";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { vendors } from "../../constants/vendor";
import { Theme } from "../../constants/theme";
import StatCard from "../../components/StatCard";
import VendorCard from "../../components/VendorCard";

type HomeScreenProps = {
    theme: Theme;
    onVendorPress: (vendorId: number) => void;
    onExploreVendors: () => void;
};

export default function HomeScreen({
    theme,
    onVendorPress,
    onExploreVendors,
}: HomeScreenProps) {
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
            <View
                style={[
                    styles.hero,
                    {
                        backgroundColor: theme.colors.primary,
                    },
                ]}
            >
                <Text
                    style={[
                        styles.heroTitle,
                        {
                            color:
                                theme.colors.primaryForeground,
                        },
                    ]}
                >
                    Discover your local economy.
                </Text>

                <Text
                    style={[
                        styles.heroDescription,
                        {
                            color:
                                theme.colors.primaryForeground,
                        },
                    ]}
                >
                    Find local vendors, discover hidden gems and
                    support the people who keep your community
                    moving.
                </Text>

                <Pressable
                    style={({ pressed }) => [
                        styles.heroButton,
                        {
                            backgroundColor:
                                theme.colors.primaryForeground,
                            opacity: pressed ? 0.85 : 1,
                        },
                    ]}
                    onPress={onExploreVendors}
                >
                    <Text
                        style={[
                            styles.heroButtonText,
                            {
                                color: theme.colors.primary,
                            },
                        ]}
                    >
                        Explore vendors near you
                    </Text>

                    <ArrowRight
                        size={18}
                        strokeWidth={2.5}
                        color={theme.colors.primary}
                    />
                </Pressable>
            </View>

            <View style={styles.stats}>
                <StatCard
                    value="2.5k+"
                    label="Vendors mapped"
                    theme={theme}
                />

                <StatCard
                    value="18k"
                    label="Community reviews"
                    theme={theme}
                />

                <StatCard
                    value="9"
                    label="Townships live"
                    theme={theme}
                />
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            {
                                color: theme.colors.foreground,
                            },
                        ]}
                    >
                        Around you right now
                    </Text>

                    <Pressable>
                        <Text
                            style={[
                                styles.seeAll,
                                {
                                    color: theme.colors
                                        .mutedForeground,
                                },
                            ]}
                        >
                            See all
                        </Text>
                    </Pressable>
                </View>

                {vendors.slice(0, 3).map((vendor) => (
                    <VendorCard
                        key={vendor.id}
                        vendor={vendor}
                        theme={theme}
                        onPress={() =>
                            onVendorPress(vendor.id)
                        }
                    />
                ))}
            </View>

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

    hero: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
    },

    challenge: {
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 10,
    },

    heroTitle: {
        fontSize: 26,
        lineHeight: 32,
        fontWeight: "800",
        marginBottom: 10,
    },

    heroDescription: {
        fontSize: 13,
        lineHeight: 20,
        opacity: 0.85,
        marginBottom: 18,
    },

    heroButton: {
        minHeight: 46,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingHorizontal: 14,
    },

    heroButtonText: {
        fontSize: 13,
        fontWeight: "700",
    },

    stats: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 28,
    },

    section: {
        marginBottom: 24,
    },

    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
    },

    seeAll: {
        fontSize: 12,
        fontWeight: "500",
    },

    bottomSpacing: {
        height: 20,
    },
});