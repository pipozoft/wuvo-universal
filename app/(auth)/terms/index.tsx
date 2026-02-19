import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useRouter } from 'expo-router';

export default function TermsOfServiceScreen() {
  const router = useRouter();

  return (
    <View className="bg-background flex-1">
      <View className="border-border flex-row items-center justify-between border-b px-4 py-3">
        <Text variant="h4">Terms of Service</Text>
        <Button variant="ghost" size="sm" onPress={() => router.back()}>
          <Text>Close</Text>
        </Button>
      </View>
      <ScrollView className="flex-1 p-6">
        <Text className="text-foreground mb-4">
          Welcome to Wuvo! By using our app, you agree to these terms.
        </Text>

        <Text variant="h4" className="mt-4 mb-2">
          1. Acceptance of Terms
        </Text>
        <Text className="text-muted-foreground mb-4">
          By accessing or using the Wuvo app, you agree to be bound by these Terms of Service. If
          you do not agree to these terms, please do not use our services.
        </Text>

        <Text variant="h4" className="mt-4 mb-2">
          2. Use of Service
        </Text>
        <Text className="text-muted-foreground mb-4">
          Wuvo provides a curated video platform for children. Parents are responsible for setting
          up and managing their children's profiles and content.
        </Text>

        <Text variant="h4" className="mt-4 mb-2">
          3. Account Security
        </Text>
        <Text className="text-muted-foreground mb-4">
          You are responsible for maintaining the confidentiality of your account information and
          for all activities that occur under your account.
        </Text>

        <Text variant="h4" className="mt-4 mb-2">
          4. Content
        </Text>
        <Text className="text-muted-foreground mb-4">
          All content available through Wuvo is curated for children. We do not guarantee the
          availability of any specific content.
        </Text>

        <Text variant="h4" className="mt-4 mb-2">
          5. Changes to Terms
        </Text>
        <Text className="text-muted-foreground mb-4">
          We may update these terms from time to time. Continued use of the app after changes
          constitutes acceptance of the new terms.
        </Text>

        <Text className="text-muted-foreground mt-6 text-sm">Last updated: February 2026</Text>
      </ScrollView>
    </View>
  );
}
