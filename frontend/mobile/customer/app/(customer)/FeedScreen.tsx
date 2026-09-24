// app/(customer)/FeedScreen.tsx

import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { feedItems } from "../../constants/feed";
import { Theme } from "../../constants/theme";
import FeedPost from "../../components/FeedPost";

type FeedScreenProps = {
    theme: Theme;
    onAddVendor: () => void;
};

export default function FeedScreen({
    theme,
    onAddVendor,
}: FeedScreenProps) {
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
                <View style={styles.headerText}>
                    <Text
                        style={[
                            styles.title,
                            {
                                color: theme.colors.foreground,
                            },
                        ]}
                    >
                        Community Feed
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
                        Live updates & vendor discoveries from locals.
                    </Text>
                </View>

                <Pressable
                    onPress={onAddVendor}
                    style={({ pressed }) => [
                        styles.addButton,
                        {
                            backgroundColor:
                                theme.colors.primary,
                            opacity: pressed ? 0.8 : 1,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.addButtonText,
                            {
                                color:
                                    theme.colors
                                        .primaryForeground,
                            },
                        ]}
                    >
                        + Add Vendor
                    </Text>
                </Pressable>
            </View>

            <View style={styles.feed}>
                {feedItems.map((item) => (
                    <FeedPost
                        key={item.id}
                        item={item}
                        theme={theme}
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

    header: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 20,
    },

    headerText: {
        flex: 1,
        paddingRight: 12,
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

    addButton: {
        minHeight: 36,
        paddingHorizontal: 11,
        borderRadius: 9,
        alignItems: "center",
        justifyContent: "center",
    },

    addButtonText: {
        fontSize: 11,
        fontWeight: "600",
    },

    feed: {
        width: "100%",
    },

    bottomSpacing: {
        height: 20,
    },
});