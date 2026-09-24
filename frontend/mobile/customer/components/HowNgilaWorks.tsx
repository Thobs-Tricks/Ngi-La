import { StyleSheet, Text, View } from "react-native";
import { Theme } from "../constants/theme";

type HowNgilaWorksProps = {
    theme: Theme;
};

const steps = [
    {
        number: "1",
        title: "Share location",
        description: "Let Ngila find local businesses around you.",
    },
    {
        number: "2",
        title: "Search & filter",
        description: "Find exactly what you need nearby.",
    },
    {
        number: "3",
        title: "Get directions",
        description: "Navigate directly to the vendor.",
    },
    {
        number: "4",
        title: "Rate & grow",
        description: "Share your experience and support local businesses.",
    },
];

export default function HowNgilaWorks({
    theme,
}: HowNgilaWorksProps) {
    return (
        <View style={styles.container}>
            <Text
                style={[
                    styles.heading,
                    {
                        color: theme.colors.foreground,
                    },
                ]}
            >
                How Ngila works
            </Text>

            <View style={styles.steps}>
                {steps.map((step) => (
                    <View key={step.number} style={styles.step}>
                        <View
                            style={[
                                styles.numberContainer,
                                {
                                    backgroundColor: theme.colors.primary,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.number,
                                    {
                                        color: theme.colors.primaryForeground,
                                    },
                                ]}
                            >
                                {step.number}
                            </Text>
                        </View>

                        <View style={styles.stepContent}>
                            <Text
                                style={[
                                    styles.title,
                                    {
                                        color: theme.colors.foreground,
                                    },
                                ]}
                            >
                                {step.title}
                            </Text>

                            <Text
                                style={[
                                    styles.description,
                                    {
                                        color: theme.colors.mutedForeground,
                                    },
                                ]}
                            >
                                {step.description}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 8,
    },

    heading: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 16,
    },

    steps: {
        gap: 16,
    },

    step: {
        flexDirection: "row",
        alignItems: "flex-start",
    },

    numberContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },

    number: {
        fontSize: 13,
        fontWeight: "700",
    },

    stepContent: {
        flex: 1,
        paddingTop: 1,
    },

    title: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 3,
    },

    description: {
        fontSize: 12,
        lineHeight: 18,
    },
});