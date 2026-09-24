import {
    Bell,
    CircleHelp,
    Info,
    Moon,
    Settings,
    Sun,
    Store,
    UserRound,
} from "lucide-react-native";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import HowNgilaWorks from "../../components/HowNgilaWorks";
import MoreOption from "../../components/MoreOption";
import ProfileCard from "../../components/ProfileCard";
import { Theme } from "../../constants/theme";

type MoreScreenProps = {
    theme: Theme;
    isDarkMode: boolean;
    onToggleDarkMode: () => void;
    onVendorTools: () => void;
    onHowNgilaWorks: () => void;
    onAboutNgila: () => void;
};

export default function MoreScreen({
    theme,
    isDarkMode,
    onToggleDarkMode,
    onVendorTools,
    onHowNgilaWorks,
    onAboutNgila,
}: MoreScreenProps) {
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
            <View style={styles.header}>
                <Text
                    style={[
                        styles.title,
                        {
                            color: theme.colors.foreground,
                        },
                    ]}
                >
                    More Options
                </Text>

                <Text
                    style={[
                        styles.subtitle,
                        {
                            color:
                                theme.colors
                                    .mutedForeground,
                        },
                    ]}
                >
                    Account settings, vendor tools & info.
                </Text>
            </View>

            <ProfileCard
                name="Nomvelo Mokoena"
                role="Community Scout"
                listings={34}
                initials="NM"
                theme={theme}
            />

            <Text
                style={[
                    styles.sectionTitle,
                    {
                        color: theme.colors.foreground,
                    },
                ]}
            >
                Profile
            </Text>

            <View style={styles.options}>
                <MoreOption
                    title="Edit Profile"
                    description="Update your name, photo and profile details."
                    theme={theme}
                    onPress={() => {}}
                    icon={
                        <UserRound
                            size={19}
                            strokeWidth={2}
                            color={theme.colors.foreground}
                        />
                    }
                />

                <MoreOption
                    title="Notifications"
                    description="Manage your notification preferences."
                    theme={theme}
                    onPress={() => {}}
                    icon={
                        <Bell
                            size={19}
                            strokeWidth={2}
                            color={theme.colors.foreground}
                        />
                    }
                />

                <MoreOption
                    title="Settings"
                    description="Manage your account and app settings."
                    theme={theme}
                    onPress={() => {}}
                    icon={
                        <Settings
                            size={19}
                            strokeWidth={2}
                            color={theme.colors.foreground}
                        />
                    }
                />
            </View>

            <Text
                style={[
                    styles.sectionTitle,
                    {
                        color: theme.colors.foreground,
                    },
                ]}
            >
                Ngila
            </Text>

            <View style={styles.options}>
                <MoreOption
                    title="For Vendors & Stalls"
                    description="Manage your listing and grow your local business."
                    theme={theme}
                    onPress={onVendorTools}
                    icon={
                        <Store
                            size={19}
                            strokeWidth={2}
                            color={theme.colors.foreground}
                        />
                    }
                />

                <MoreOption
                    title="How Ngila Works"
                    description="Learn how Ngila connects communities with local vendors."
                    theme={theme}
                    onPress={onHowNgilaWorks}
                    icon={
                        <CircleHelp
                            size={19}
                            strokeWidth={2}
                            color={theme.colors.foreground}
                        />
                    }
                />

                <MoreOption
                    title="About Ngila Project"
                    description="Learn more about the project and its mission."
                    theme={theme}
                    onPress={onAboutNgila}
                    icon={
                        <Info
                            size={19}
                            strokeWidth={2}
                            color={theme.colors.foreground}
                        />
                    }
                />
            </View>

            <Text
                style={[
                    styles.sectionTitle,
                    {
                        color: theme.colors.foreground,
                    },
                ]}
            >
                Appearance
            </Text>

            <Pressable
                onPress={onToggleDarkMode}
                style={({ pressed }) => [
                    styles.themeOption,
                    {
                        backgroundColor:
                            theme.colors.card,
                        borderColor:
                            theme.colors.border,
                        opacity: pressed ? 0.7 : 1,
                    },
                ]}
            >
                <View
                    style={[
                        styles.themeIconContainer,
                        {
                            backgroundColor:
                                theme.colors.secondary,
                        },
                    ]}
                >
                    {isDarkMode ? (
                        <Sun
                            size={19}
                            strokeWidth={2}
                            color={theme.colors.foreground}
                        />
                    ) : (
                        <Moon
                            size={19}
                            strokeWidth={2}
                            color={theme.colors.foreground}
                        />
                    )}
                </View>

                <View style={styles.themeContent}>
                    <Text
                        style={[
                            styles.themeTitle,
                            {
                                color:
                                    theme.colors.foreground,
                            },
                        ]}
                    >
                        Dark Theme
                    </Text>

                    <Text
                        style={[
                            styles.themeDescription,
                            {
                                color:
                                    theme.colors
                                        .mutedForeground,
                            },
                        ]}
                    >
                        Switch between light and dark mode.
                    </Text>
                </View>

                <Switch
                    value={isDarkMode}
                    onValueChange={onToggleDarkMode}
                    trackColor={{
                        false: theme.colors.border,
                        true: theme.colors.primary,
                    }}
                    thumbColor={
                        theme.colors.background
                    }
                />
            </Pressable>

            <HowNgilaWorks theme={theme} />

            <Text
                style={[
                    styles.footer,
                    {
                        color:
                            theme.colors.mutedForeground,
                    },
                ]}
            >
                Ngila Mobile App v1.2.0 • Built with OkLch Colors
            </Text>

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

    header: {
        marginBottom: 20,
    },

    title: {
        fontSize: 23,
        fontWeight: "800",
        marginBottom: 5,
    },

    subtitle: {
        fontSize: 12,
        lineHeight: 18,
    },

    sectionTitle: {
        fontSize: 13,
        fontWeight: "700",
        marginBottom: 10,
        marginTop: 4,
    },

    options: {
        width: "100%",
        marginBottom: 18,
    },

    themeOption: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderWidth: 1,
        borderRadius: 12,
        marginBottom: 22,
    },

    themeIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },

    themeContent: {
        flex: 1,
    },

    themeTitle: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 3,
    },

    themeDescription: {
        fontSize: 12,
        lineHeight: 17,
    },

    footer: {
        fontSize: 10,
        textAlign: "center",
        marginTop: 24,
        lineHeight: 16,
    },

    bottomSpacing: {
        height: 20,
    },
});