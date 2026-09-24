import {
    Heart,
    MessageCircle,
    Share2,
} from "lucide-react-native";
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { FeedItem } from "../constants/feed";
import { Theme } from "../constants/theme";

type FeedPostProps = {
    item: FeedItem;
    theme: Theme;
};

export default function FeedPost({
    item,
    theme,
}: FeedPostProps) {
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
            <View style={styles.header}>
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
                                color:
                                    theme.colors.primaryForeground,
                            },
                        ]}
                    >
                        {item.avatar}
                    </Text>
                </View>

                <View style={styles.userInfo}>
                    <View style={styles.nameRow}>
                        <Text
                            style={[
                                styles.userName,
                                {
                                    color:
                                        theme.colors.foreground,
                                },
                            ]}
                        >
                            {item.user}
                        </Text>

                        <View
                            style={[
                                styles.roleBadge,
                                {
                                    backgroundColor:
                                        theme.colors.secondary,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.roleText,
                                    {
                                        color:
                                            theme.colors
                                                .secondaryForeground,
                                    },
                                ]}
                            >
                                {item.role}
                            </Text>
                        </View>
                    </View>

                    <Text
                        style={[
                            styles.time,
                            {
                                color:
                                    theme.colors.mutedForeground,
                            },
                        ]}
                    >
                        {item.time}
                    </Text>
                </View>
            </View>

            <Text
                style={[
                    styles.content,
                    {
                        color: theme.colors.foreground,
                    },
                ]}
            >
                {item.content}
            </Text>

            <View
                style={[
                    styles.vendorBox,
                    {
                        backgroundColor: theme.colors.secondary,
                        borderColor: theme.colors.border,
                    },
                ]}
            >
                <Image
                    source={{ uri: item.vendorImage }}
                    style={styles.vendorImage}
                />

                <View style={styles.vendorInfo}>
                    <Text
                        numberOfLines={1}
                        style={[
                            styles.vendorName,
                            {
                                color:
                                    theme.colors.foreground,
                            },
                        ]}
                    >
                        {item.vendorName}
                    </Text>

                    <Text
                        style={[
                            styles.vendorCategory,
                            {
                                color:
                                    theme.colors.mutedForeground,
                            },
                        ]}
                    >
                        {item.vendorCategory}
                    </Text>
                </View>
            </View>

            <View
                style={[
                    styles.actions,
                    {
                        borderTopColor: theme.colors.border,
                    },
                ]}
            >
                <Pressable style={styles.action}>
                    <View style={styles.actionContent}>
                        <Heart
                            size={14}
                            strokeWidth={2}
                            color={
                                theme.colors.mutedForeground
                            }
                        />

                        <Text
                            style={[
                                styles.actionText,
                                {
                                    color:
                                        theme.colors
                                            .mutedForeground,
                                },
                            ]}
                        >
                            {item.likes}
                        </Text>
                    </View>
                </Pressable>

                <Pressable style={styles.action}>
                    <View style={styles.actionContent}>
                        <MessageCircle
                            size={14}
                            strokeWidth={2}
                            color={
                                theme.colors.mutedForeground
                            }
                        />

                        <Text
                            style={[
                                styles.actionText,
                                {
                                    color:
                                        theme.colors
                                            .mutedForeground,
                                },
                            ]}
                        >
                            {item.comments}
                        </Text>
                    </View>
                </Pressable>

                <Pressable style={styles.action}>
                    <View style={styles.actionContent}>
                        <Share2
                            size={14}
                            strokeWidth={2}
                            color={
                                theme.colors.mutedForeground
                            }
                        />

                        <Text
                            style={[
                                styles.actionText,
                                {
                                    color:
                                        theme.colors
                                            .mutedForeground,
                                },
                            ]}
                        >
                            Share
                        </Text>
                    </View>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },

    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },

    avatarText: {
        fontSize: 12,
        fontWeight: "700",
    },

    userInfo: {
        flex: 1,
    },

    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
    },

    userName: {
        fontSize: 14,
        fontWeight: "700",
        marginRight: 7,
    },

    roleBadge: {
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 999,
    },

    roleText: {
        fontSize: 9,
        fontWeight: "600",
    },

    time: {
        fontSize: 11,
        marginTop: 3,
    },

    content: {
        fontSize: 14,
        lineHeight: 21,
        marginBottom: 12,
    },

    vendorBox: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 10,
        padding: 8,
    },

    vendorImage: {
        width: 48,
        height: 48,
        borderRadius: 7,
    },

    vendorInfo: {
        flex: 1,
        marginLeft: 10,
    },

    vendorName: {
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 3,
    },

    vendorCategory: {
        fontSize: 11,
    },

    actions: {
        flexDirection: "row",
        alignItems: "center",
        borderTopWidth: 1,
        marginTop: 12,
        paddingTop: 10,
    },

    action: {
        flex: 1,
    },

    actionContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
    },

    actionText: {
        fontSize: 11,
    },
});