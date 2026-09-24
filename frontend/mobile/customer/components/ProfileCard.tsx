import { StyleSheet, Text, View } from "react-native";
import { Theme } from "../constants/theme";

type ProfileCardProps = {
    name: string;
    role: string;
    listings: number;
    initials: string;
    theme: Theme;
};

export default function ProfileCard({
    name,
    role,
    listings,
    initials,
    theme,
}: ProfileCardProps) {
    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                },
            ]}
        >
            <View
                style={[
                    styles.avatar,
                    {
                        backgroundColor: theme.colors.primary,
                    },
                ]}
            >
                <Text
                    style={[
                        styles.avatarText,
                        {
                            color: theme.colors.primaryForeground,
                        },
                    ]}
                >
                    {initials}
                </Text>
            </View>

            <View style={styles.content}>
                <Text
                    style={[
                        styles.name,
                        {
                            color: theme.colors.foreground,
                        },
                    ]}
                >
                    {name}
                </Text>

                <Text
                    style={[
                        styles.role,
                        {
                            color: theme.colors.mutedForeground,
                        },
                    ]}
                >
                    {role}
                </Text>

                <Text
                    style={[
                        styles.listings,
                        {
                            color: theme.colors.foreground,
                        },
                    ]}
                >
                    {listings} Listings Added
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderWidth: 1,
        borderRadius: 16,
        marginBottom: 20,
    },

    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
    },

    avatarText: {
        fontSize: 16,
        fontWeight: "700",
    },

    content: {
        flex: 1,
    },

    name: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 3,
    },

    role: {
        fontSize: 12,
        marginBottom: 5,
    },

    listings: {
        fontSize: 12,
        fontWeight: "600",
    },
});