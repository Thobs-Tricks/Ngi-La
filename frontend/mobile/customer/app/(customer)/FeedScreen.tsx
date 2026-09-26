import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Search, X } from "lucide-react-native";
import FeedPost from "../../components/FeedPost";
import { Theme } from "../../constants/theme";
import useFeed from "../../hooks/useFeed";

type FeedScreenProps = {
    theme: Theme;
    onAddPost: () => void;
};

export default function FeedScreen({
    theme,
    onAddPost,
}: FeedScreenProps) {
    const {
        filteredFeedItems,
        loading,
        refreshing,
        error,
        refresh,
        searchQuery,
        setSearchQuery,
    } = useFeed();

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
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={refresh}
                    tintColor={theme.colors.primary}
                    colors={[theme.colors.primary]}
                />
            }
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
                    onPress={onAddPost}
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
                        + Add Post
                    </Text>
                </Pressable>
            </View>

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
                    size={18}
                    strokeWidth={2}
                    color={theme.colors.mutedForeground}
                />

                <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search posts..."
                    placeholderTextColor={
                        theme.colors.mutedForeground
                    }
                    style={[
                        styles.searchInput,
                        {
                            color: theme.colors.foreground,
                        },
                    ]}
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                {searchQuery.length > 0 && (
                    <Pressable
                        onPress={() => setSearchQuery("")}
                        hitSlop={8}
                    >
                        <X
                            size={18}
                            strokeWidth={2}
                            color={theme.colors.mutedForeground}
                        />
                    </Pressable>
                )}
            </View>

            {loading ? (
                <View style={styles.stateContainer}>
                    <ActivityIndicator
                        size="small"
                        color={theme.colors.primary}
                    />

                    <Text
                        style={[
                            styles.stateText,
                            {
                                color:
                                    theme.colors
                                        .mutedForeground,
                            },
                        ]}
                    >
                        Loading feed...
                    </Text>
                </View>
            ) : error ? (
                <View style={styles.stateContainer}>
                    <Text
                        style={[
                            styles.stateTitle,
                            {
                                color: theme.colors.foreground,
                            },
                        ]}
                    >
                        Unable to load feed
                    </Text>

                    <Text
                        style={[
                            styles.stateText,
                            {
                                color:
                                    theme.colors
                                        .mutedForeground,
                            },
                        ]}
                    >
                        {error}
                    </Text>

                    <Pressable
                        onPress={refresh}
                        style={[
                            styles.retryButton,
                            {
                                backgroundColor:
                                    theme.colors.primary,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.retryButtonText,
                                {
                                    color:
                                        theme.colors
                                            .primaryForeground,
                                },
                            ]}
                        >
                            Try Again
                        </Text>
                    </Pressable>
                </View>
            ) : filteredFeedItems.length === 0 ? (
                <View style={styles.stateContainer}>
                    <Text
                        style={[
                            styles.stateTitle,
                            {
                                color: theme.colors.foreground,
                            },
                        ]}
                    >
                        {searchQuery.trim()
                            ? "No posts found"
                            : "No posts yet"}
                    </Text>

                    <Text
                        style={[
                            styles.stateText,
                            {
                                color:
                                    theme.colors
                                        .mutedForeground,
                            },
                        ]}
                    >
                        {searchQuery.trim()
                            ? "Try searching for a different name, vendor, category, or keyword."
                            : "Community updates will appear here."}
                    </Text>
                </View>
            ) : (
                <View style={styles.feed}>
                    {filteredFeedItems.map((item) => (
                        <FeedPost
                            key={item.id}
                            item={item}
                            theme={theme}
                        />
                    ))}
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

    header: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 16,
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

    searchContainer: {
        minHeight: 44,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        marginBottom: 20,
    },

    searchInput: {
        flex: 1,
        fontSize: 13,
        marginLeft: 9,
        paddingVertical: 0,
    },

    feed: {
        width: "100%",
    },

    stateContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 48,
    },

    stateTitle: {
        fontSize: 15,
        fontWeight: "700",
        marginBottom: 6,
        textAlign: "center",
    },

    stateText: {
        fontSize: 12,
        lineHeight: 18,
        textAlign: "center",
        maxWidth: 280,
        marginTop: 6,
    },

    retryButton: {
        minHeight: 36,
        paddingHorizontal: 16,
        borderRadius: 9,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 16,
    },

    retryButtonText: {
        fontSize: 12,
        fontWeight: "600",
    },

    bottomSpacing: {
        height: 20,
    },
});