// Third-party native components (unlike core RN primitives like View/Text)
// don't understand `className` out of the box in NativeWind v4 — the prop is
// silently ignored, which is why LinearGradient headers and the BlurView
// glass cards weren't sizing/padding correctly (worked in JSX, did nothing
// at runtime). `cssInterop` registers them so `className` maps to `style`.
import { cssInterop } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

cssInterop(LinearGradient, { className: 'style' });
cssInterop(BlurView, { className: 'style' });
