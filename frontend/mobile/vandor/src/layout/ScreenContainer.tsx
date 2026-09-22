import React from 'react';
import { ScrollView, View, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenContainerProps extends ViewProps {
  children: React.ReactNode;
  scroll?: boolean;
  className?: string;
}

// Shared page shell: cream background + safe-area padding, used by every screen.
export default function ScreenContainer({
  children,
  scroll = false,
  className = '',
  ...rest
}: ScreenContainerProps) {
  const Wrapper = scroll ? ScrollView : View;
  const wrapperProps = scroll
    ? { contentContainerStyle: { flexGrow: 1 }, keyboardShouldPersistTaps: 'handled' as const }
    : {};

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <Wrapper className={`flex-1 px-6 ${className}`} {...wrapperProps} {...rest}>
        {children}
      </Wrapper>
    </SafeAreaView>
  );
}
