export const lightTheme = {
    colors: {
        background: "#F9F6EF",
        foreground: "#263D32",

        card: "#FFFEF9",
        cardForeground: "#263D32",

        popover: "#FFFEF9",
        popoverForeground: "#263D32",

        primary: "#C86F3F",
        primaryForeground: "#FBF8F0",

        secondary: "#F1EBDD",
        secondaryForeground: "#4A5148",

        muted: "#F3EEE4",
        mutedForeground: "#747968",

        accent: "#E8B85C",
        accentForeground: "#4A3B25",

        destructive: "#D9573F",
        destructiveForeground: "#FBF8F0",

        border: "#E6DFD1",
        input: "#E6DFD1",
        ring: "#C86F3F",

        ink: "#294238",
        inkForeground: "#F5F0E6",

        sand: "#F4EFE5",

        verified: "#5A9B7A",
        verifiedForeground: "#FFFFFF",

        success: "#5A9B7A",
        successForeground: "#FFFFFF",

        warning: "#D99A3D",
        warningForeground: "#FFFFFF",

        overlay: "rgba(35, 45, 39, 0.5)",
        transparent: "transparent",
    },

    typography: {
        fontFamily: {
            regular: "System",
            medium: "System",
            semibold: "System",
            bold: "System",
        },

        fontSize: {
            xs: 11,
            sm: 13,
            base: 15,
            lg: 17,
            xl: 20,
            "2xl": 24,
            "3xl": 30,
        },

        lineHeight: {
            tight: 18,
            normal: 22,
            relaxed: 26,
            loose: 32,
        },

        fontWeight: {
            regular: "400" as const,
            medium: "500" as const,
            semibold: "600" as const,
            bold: "700" as const,
            extrabold: "800" as const,
        },
    },

    spacing: {
        0: 0,
        1: 4,
        2: 8,
        3: 12,
        4: 16,
        5: 20,
        6: 24,
        7: 28,
        8: 32,
        10: 40,
        12: 48,
        16: 64,
    },

    radius: {
        none: 0,
        sm: 6,
        md: 8,
        lg: 12,
        xl: 16,
        "2xl": 20,
        full: 999,
    },

    shadows: {
        none: {
            shadowColor: "transparent",
            shadowOffset: {
                width: 0,
                height: 0,
            },
            shadowOpacity: 0,
            shadowRadius: 0,
            elevation: 0,
        },

        sm: {
            shadowColor: "#294238",
            shadowOffset: {
                width: 0,
                height: 1,
            },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
        },

        md: {
            shadowColor: "#294238",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: 3,
        },

        lg: {
            shadowColor: "#294238",
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.12,
            shadowRadius: 12,
            elevation: 6,
        },
    },

    layout: {
        appMaxWidth: 420,
        horizontalPadding: 16,
        sectionSpacing: 24,
        cardPadding: 16,
        headerHeight: 64,
        bottomNavigationHeight: 72,
    },
};

export const darkTheme = {
    colors: {
        background: "#304239",
        foreground: "#F6F1E7",

        card: "#3B4C43",
        cardForeground: "#F6F1E7",

        popover: "#3B4C43",
        popoverForeground: "#F6F1E7",

        primary: "#D9854F",
        primaryForeground: "#28382F",

        secondary: "#43534A",
        secondaryForeground: "#F6F1E7",

        muted: "#43534A",
        mutedForeground: "#C2C2AE",

        accent: "#E8B85C",
        accentForeground: "#40351F",

        destructive: "#E1745E",
        destructiveForeground: "#FFF9F0",

        border: "rgba(255, 255, 255, 0.12)",
        input: "rgba(255, 255, 255, 0.15)",
        ring: "#D9854F",

        ink: "#25372E",
        inkForeground: "#F6F1E7",

        sand: "#414F46",

        verified: "#78B38F",
        verifiedForeground: "#FFFFFF",

        success: "#78B38F",
        successForeground: "#193326",

        warning: "#E0A84D",
        warningForeground: "#403015",

        overlay: "rgba(0, 0, 0, 0.7)",
        transparent: "transparent",
    },

    typography: lightTheme.typography,
    spacing: lightTheme.spacing,
    radius: lightTheme.radius,
    shadows: lightTheme.shadows,
    layout: lightTheme.layout,
};

export type Theme = typeof lightTheme;

export type ThemeMode = "light" | "dark";

export const themes = {
    light: lightTheme,
    dark: darkTheme,
};

export const defaultTheme: ThemeMode = "light";
