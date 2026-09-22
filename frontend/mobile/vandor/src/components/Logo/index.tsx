import { Image, ImageStyle, StyleProp } from 'react-native';

// Real NGiLA brand assets (see assets/logo.png for the original export).
const MARK = require('../../../assets/icon-mark.png'); // icon-only: pin + stall + rays + map wings
const FULL = require('../../../assets/logo-full.png'); // full lockup: mark + "NGiLA" + tagline

// Natural aspect ratios (height / width) of the source PNGs, so scaling by
// `size` keeps everything proportioned correctly.
const ASPECT = {
  mark: 930 / 930,
  full: 1073 / 1108,
} as const;

interface LogoProps {
  /** width in px; height is derived from the asset's natural aspect ratio */
  size?: number;
  /** 'mark' = icon only (compact headers, nav bars); 'full' = mark + wordmark + tagline */
  variant?: 'mark' | 'full';
  style?: StyleProp<ImageStyle>;
}

export default function Logo({ size = 96, variant = 'mark', style }: LogoProps) {
  const source = variant === 'full' ? FULL : MARK;
  const height = size * ASPECT[variant];

  return (
    <Image
      source={source}
      resizeMode="contain"
      style={[{ width: size, height }, style]}
      accessibilityRole="image"
      accessibilityLabel="NGiLA logo"
    />
  );
}
