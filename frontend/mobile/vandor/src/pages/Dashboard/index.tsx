import React from "react";
import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import ScreenContainer from "../../layout/ScreenContainer";
import StatCard from "../../components/StatCard";
import AppStatusBar from "../../components/AppStatusBar";
import { useAuth } from "../../hooks/useAuth";
import { useThemeColors } from "../../styles/theme";

// UI-only placeholder data — swap for the real numbers once the backend
// exposes reviews / tags / views / saves for a vendor.
const STATS = [
  {
    icon: "star" as const,
    label: "Reviews",
    value: "24",
    caption: "4.8 avg rating",
    tint: "accent" as const,
  },
  {
    icon: "at-sign" as const,
    label: "Tagged Posts",
    value: "12",
    caption: "+3 this week",
    tint: "primary" as const,
  },
  {
    icon: "eye" as const,
    label: "Profile Views",
    value: "138",
    caption: "+18 this week",
    tint: "verified" as const,
  },
  {
    icon: "bookmark" as const,
    label: "Saved by Customers",
    value: "9",
    tint: "secondary" as const,
  },
];

const ACTIVITY = [
  {
    icon: "star" as const,
    text: "Lindiwe M. left a 5-star review",
    time: "2h ago",
  },
  {
    icon: "at-sign" as const,
    text: "Tagged in a post by @sipho_eats",
    time: "1d ago",
  },
  {
    icon: "bookmark" as const,
    text: "Your spaza was saved by a new customer",
    time: "2d ago",
  },
];

export default function DashboardScreen() {
  const { session } = useAuth();
  const colors = useThemeColors();
  const firstName = session?.user.firstName ?? "there";

  return (
    <ScreenContainer scroll className="pt-6">
      <AppStatusBar />
      <View>
        <Text className="text-sm text-muted-foreground">Welcome back,</Text>
        <Text className="text-2xl font-bold text-foreground">{firstName}</Text>
      </View>

      <View className="mt-6 flex-row gap-3">
        <StatCard {...STATS[0]} />
        <StatCard {...STATS[1]} />
      </View>
      <View className="mt-3 flex-row gap-3">
        <StatCard {...STATS[2]} />
        <StatCard {...STATS[3]} />
      </View>

      <Text className="mb-2 mt-7 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Recent Activity
      </Text>
      <View className="rounded-2xl border border-border bg-card">
        {ACTIVITY.map((item, i) => (
          <View
            key={item.text}
            className={`flex-row items-center gap-3 px-4 py-3.5 ${
              i === ACTIVITY.length - 1 ? "" : "border-b border-border"
            }`}
          >
            <View className="h-8 w-8 items-center justify-center rounded-full bg-muted">
              <Feather
                name={item.icon}
                size={14}
                color={colors.mutedForeground}
              />
            </View>
            <Text className="flex-1 text-sm text-foreground">{item.text}</Text>
            <Text className="text-xs text-muted-foreground">{item.time}</Text>
          </View>
        ))}
      </View>

      <View className="mb-6 mt-6 rounded-2xl border border-border bg-card p-4">
        <Text className="text-sm font-semibold text-foreground">
          Sales overview
        </Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          Orders, stock and earnings will show up here once that part of the
          backend is connected.
        </Text>
      </View>
    </ScreenContainer>
  );
}
