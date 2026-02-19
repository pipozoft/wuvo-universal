import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useRouter } from 'expo-router';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <View className="bg-background flex-1">
      <View className="border-border flex-row items-center justify-between border-b px-4 py-3">
        <Text variant="h4">Privacy Policy</Text>
        <Button variant="ghost" size="sm" onPress={() => router.back()}>
          <Text>Close</Text>
        </Button>
      </View>
      <ScrollView className="flex-1 p-6">
        <Text className="text-foreground mb-4">
          At Wuvo, we take your privacy seriously. This policy explains how we collect, use, and
          protect your information.
        </Text>

        <Text variant="h4" className="mt-4 mb-2">
          1. Information We Collect
        </Text>
        <Text className="text-muted-foreground mb-4">
          We collect information you provide when creating an account, including email address and
          child profile information. We also collect usage data to improve our service.
        </Text>

        <Text variant="h4" className="mt-4 mb-2">
          2. How We Use Your Information
        </Text>
        <Text className="text-muted-foreground mb-4">
          We use your information to provide and improve our services, personalize content
          recommendations, and communicate with you about your account.
        </Text>

        <Text variant="h4" className="mt-4 mb-2">
          3. Data Security
        </Text>
        <Text className="text-muted-foreground mb-4">
          We implement appropriate security measures to protect your personal information. However,
          no method of transmission over the internet is 100% secure.
        </Text>

        <Text variant="h4" className="mt-4 mb-2">
          4. Children's Privacy
        </Text>
        <Text className="text-muted-foreground mb-4">
          Wuvo is designed for children to use under parental supervision. We do not knowingly
          collect personal information from children under 13 without parental consent.
        </Text>

        <Text variant="h4" className="mt-4 mb-2">
          5. Your Rights
        </Text>
        <Text className="text-muted-foreground mb-4">
          You have the right to access, update, or delete your personal information. Contact us if
          you have any questions about your data.
        </Text>

        <Text variant="h4" className="mt-4 mb-2">
          6. Changes to Privacy Policy
        </Text>
        <Text className="text-muted-foreground mb-4">
          We may update this privacy policy from time to time. We will notify you of any significant
          changes.
        </Text>

        <Text className="text-muted-foreground mt-6 text-sm">Last updated: February 2026</Text>
      </ScrollView>
    </View>
  );
}
