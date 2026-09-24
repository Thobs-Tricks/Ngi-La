import {
    House,
    Menu,
    Newspaper,
    Search,
} from "lucide-react-native";
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Theme } from "../constants/theme";

export type CustomerTab =
    | "home"
    | "discover"
    | "feed"
    | "more";

type BottomNavigationProps = {
    activeTab: CustomerTab;
    theme: Theme;
    onTabPress: (tab: CustomerTab) => void;
};

const tabs: {
    key: CustomerTab;
    label: string;
    icon: typeof House;
}[] = [
    {
        key: "home",
        label: "Home",
        icon: House,
    },
    {
        key: "discover",
        label: "Discover",
        icon: Search,
    },
    {
        key: "feed",
        label: "Feed",
        icon: Newspaper,
    },
    {
        key: "more",
        label: "More",
        icon: Menu,
    },
];

export default function BottomNavigation({
    activeTab,
    theme,
    onTabPress,
}: BottomNavigationProps) {
    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.background,
                    borderTopColor: theme.colors.border,
                },
            ]}
        >
            {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                const Icon = tab.icon;

                return (
                    <Pressable
                        key={tab.key}
                        onPress={() => onTabPress(tab.key)}
                        style={({ pressed }) => [
                            styles.tab,
                            {
                                opacity: pressed ? 0.7 : 1,
                            },
                        ]}
                    >
                        <View
                            style={[
                                styles.iconContainer,
                                isActive && {
                                    backgroundColor:
                                        theme.colors.secondary,
                                },
                            ]}
                        >
                            <Icon
                                size={19}
                                strokeWidth={isActive ? 2.4 : 2}
                                color={
                                    isActive
                                        ? theme.colors.foreground
                                        : theme.colors
                                              .mutedForeground
                                }
                            />
                        </View>

                        <Text
                            style={[
                                styles.label,
                                {
                                    color: isActive
                                        ? theme.colors.foreground
                                        : theme.colors
                                              .mutedForeground,
                                    fontWeight: isActive
                                        ? "600"
                                        : "500",
                                },
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 72,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        borderTopWidth: 1,
        paddingHorizontal: 8,
    },

    tab: {
        flex: 1,
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },

    iconContainer: {
        width: 38,
        height: 30,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 3,
    },

    label: {
        fontSize: 10,
    },
});