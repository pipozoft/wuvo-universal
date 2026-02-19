import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser, useClerk } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/brand/Logo';

const AVATAR_COLORS = [
  '#ff754f',
  '#d800b2',
  '#ff007a',
  '#ffbd43',
  '#00c394',
  '#009ffc',
  '#00b2cc',
  '#0066ff',
];

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColor = (name: string) => {
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

export default function ProfileSelectionScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const children = useQuery(api.children.listChildren);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const handleProfilePress = (childId: string) => {
    setSelectedChild(childId);
    setTimeout(() => {
      router.push(`/child/${childId}`);
    }, 150);
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/sign-in');
  };

  if (children === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0f0f0f] p-6">
        <ActivityIndicator size="large" color="#322DE2" />
      </View>
    );
  }

  const renderProfile = ({ item }: { item: any }) => {
    const isSelected = selectedChild === item._id;
    const avatarColor = getAvatarColor(item.name);
    const avatarSize = isLandscape ? 80 : 100;
    const cardWidth = isLandscape ? 120 : 140;

    return (
      <TouchableOpacity
        className={cn(
          'items-center rounded-2xl bg-[#1a1a1a] p-4',
          isSelected && 'scale-95 bg-[#2a2a2a]'
        )}
        style={{ width: cardWidth }}
        onPress={() => handleProfilePress(item._id)}
        activeOpacity={0.7}>
        <View
          className="mb-3 items-center justify-center"
          style={{
            backgroundColor: avatarColor,
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
          }}>
          {item.avatar ? (
            <Image
              source={{ uri: item.avatar }}
              style={{
                width: avatarSize,
                height: avatarSize,
                borderRadius: avatarSize / 2,
              }}
            />
          ) : (
            <Text className={cn('font-bold text-white', isLandscape ? 'text-[28px]' : 'text-4xl')}>
              {getInitials(item.name)}
            </Text>
          )}
        </View>
        <Text className="text-center text-base font-semibold text-white">{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-[#0f0f0f] p-6">
      <View className={cn('items-center', isLandscape ? 'mt-5 mb-5' : 'mt-14 mb-10')}>
        <Logo height={isLandscape ? 40 : 50} />
        <Text
          className={cn('mt-8 mb-2 font-bold text-white', isLandscape ? 'text-[28px]' : 'text-[32px]')}>
          Who's watching?
        </Text>
      </View>

      {children.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <Text className="mb-3 text-2xl font-bold text-white">No profiles yet</Text>
          <Text className="text-center text-base leading-6 text-[#999999]">
            Ask your parent to create a profile for you in the parent app.
          </Text>
        </View>
      ) : (
        <FlatList
          data={children}
          renderItem={renderProfile}
          keyExtractor={(item) => item._id}
          numColumns={isLandscape ? 4 : 2}
          key={isLandscape ? 'landscape' : 'portrait'}
          contentContainerStyle={{
            paddingVertical: isLandscape ? 10 : 20,
          }}
          columnWrapperStyle={{
            justifyContent: 'center',
            gap: isLandscape ? 30 : 20,
            marginBottom: isLandscape ? 15 : 20,
          }}
        />
      )}

      <View className="mt-auto pb-10">
        <Button variant="link" size="sm" onPress={handleSignOut}>
          <Text>Sign Out</Text>
        </Button>
      </View>
    </View>
  );
}
