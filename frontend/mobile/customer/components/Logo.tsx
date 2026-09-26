import {
    Image,
    ImageStyle,
    StyleProp,
} from "react-native";

const MARK = require("../assets/icon-mark.png");
const FULL = require("../assets/logo-full.png");

const ASPECT = {
    mark: 930 / 930,
    full: 1073 / 1108,
} as const;

type LogoProps = {
    size?: number;
    variant?: "mark" | "full";
    style?: StyleProp<ImageStyle>;
};

export default function Logo({
    size = 96,
    variant = "mark",
    style,
}: LogoProps) {
    const source =
        variant === "full" ? FULL : MARK;

    const height =
        size * ASPECT[variant];

    return (
        <Image
            source={source}
            resizeMode="contain"
            style={[
                {
                    width: size,
                    height,
                },
                style,
            ]}
            accessibilityRole="image"
            accessibilityLabel="Ngila logo"
        />
    );
}