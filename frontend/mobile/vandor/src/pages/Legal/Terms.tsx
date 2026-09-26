import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppStatusBar from '../../components/AppStatusBar';
import { useThemeColors } from '../../styles/theme';

const SECTIONS: { title: string; body: string }[] = [
  {
    title: '1. Acceptance',
    body:
      "By creating a vendor account on NGiLA you agree to these terms. If you're setting this up on behalf of a spaza shop or business, you're confirming you have the authority to do so.",
  },
  {
    title: '2. Your Vendor Profile',
    body:
      'The business name, description, categories, location, contact details and photos you add are shown to customers browsing NGiLA. Keep them accurate — misleading listings (wrong location, fake trading hours, etc.) may be removed.',
  },
  {
    title: '3. Content You Upload',
    body:
      'You keep ownership of any photos or text you add to your profile, but you give NGiLA permission to display them within the app so customers can find and evaluate your spaza.',
  },
  {
    title: '4. Reviews & Ratings',
    body:
      'Customers may leave ratings and reviews on your profile. NGiLA does not guarantee reviews will always be positive or accurate, but clearly abusive or fake reviews can be reported for removal.',
  },
  {
    title: '5. Acceptable Use',
    body:
      "Don't use NGiLA to post false information, impersonate another business, discriminate against customers, or engage in unsafe or unlawful trading practices.",
  },
  {
    title: '6. Account & Termination',
    body:
      'You can deactivate your vendor account at any time. NGiLA may suspend or remove accounts that violate these terms or put customers at risk.',
  },
  {
    title: '7. Changes to These Terms',
    body:
      "These terms may be updated as NGiLA grows. We'll let you know about significant changes in the app.",
  },
  {
    title: '8. Contact',
    body: 'Questions about these terms? Reach out to the NGiLA team from your Profile screen.',
  },
];

// Placeholder copy for now — swap in the finalized legal text once it's
// ready; this just gives Register (and Profile) somewhere real to link to.
export default function TermsScreen() {
  const navigation = useNavigation();
  const colors = useThemeColors();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right', 'bottom']}>
      <AppStatusBar />
      <View className="flex-row items-center gap-3 border-b border-border px-5 py-3.5">
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} className="h-9 w-9 items-center justify-center">
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">Terms &amp; Conditions</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-5" contentContainerStyle={{ paddingBottom: 24 }}>
        {SECTIONS.map((section, i) => (
          <View key={section.title} className={i === 0 ? '' : 'mt-5'}>
            <Text className="text-sm font-semibold text-foreground">{section.title}</Text>
            <Text className="mt-1.5 text-sm leading-5 text-muted-foreground">{section.body}</Text>
          </View>
        ))}
        <Text className="mb-4 mt-8 text-xs text-muted-foreground">
          This is placeholder wording while NGiLA's full terms are finalized — it'll be replaced with the
          complete legal text soon.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
