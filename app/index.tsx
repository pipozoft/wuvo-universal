import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser, useClerk } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  useWindowDimensions,
  StyleSheet,
  Alert,
  Text,
} from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/brand/Logo';
import { User } from 'lucide-react-native';
import { getAvatarAsset } from '@/lib/avatar';
import { SafeAreaView } from 'react-native-safe-area-context';

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
      router.replace(`/child/${childId}`);
    }, 150);
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/sign-in');
        },
      },
    ]);
  };

  if (children === undefined) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#322DE2" />
        </View>
      </SafeAreaView>
    );
  }

  const renderProfile = ({ item, index }: { item: any; index: number }) => {
    return (
      <ProfileCard
        item={item}
        index={index}
        isLandscape={isLandscape}
        onPress={() => handleProfilePress(item._id)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={children}
        renderItem={renderProfile}
        keyExtractor={(item) => item._id}
        numColumns={isLandscape ? 4 : 2}
        key={isLandscape ? 'landscape' : 'portrait'}
        contentContainerStyle={{
          paddingVertical: isLandscape ? 20 : 40,
          paddingHorizontal: 24,
        }}
        columnWrapperStyle={{
          justifyContent: 'center',
          gap: isLandscape ? 30 : 20,
          marginBottom: isLandscape ? 15 : 20,
        }}
        ListHeaderComponent={
          <Animated.View entering={FadeIn.duration(600)} style={styles.headerContainer}>
            <Logo height={isLandscape ? 50 : 60} />
            <Text style={isLandscape ? styles.titleLandscape : styles.titlePortrait}>
              Who is watching?
            </Text>
          </Animated.View>
        }
        ListEmptyComponent={
          <Animated.View entering={FadeInUp.delay(300).duration(500)} style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No profiles yet</Text>
            <Text style={styles.emptySubtitle}>
              Ask your parent to create a profile for you in the parent app.
            </Text>
          </Animated.View>
        }
        ListFooterComponent={
          <Animated.View entering={FadeIn.delay(800)} style={styles.signOutContainer}>
            <Button variant="ghost" size="sm" onPress={handleSignOut}>
              <Text style={{ color: '#ffffff' }}>Sign Out</Text>
            </Button>
          </Animated.View>
        }
      />
    </SafeAreaView>
  );
}

function ProfileCard({
  item,
  index,
  isLandscape,
  onPress,
}: {
  item: any;
  index: number;
  isLandscape: boolean;
  onPress: () => void;
}) {
  const avatarSize = isLandscape ? 80 : 100;
  const cardWidth = isLandscape ? 120 : 140;
  const avatarAsset = getAvatarAsset(item.avatar);
  const accentColor = '#322DE2';
  const gradientColor = accentColor + '40';
  const highlightColor = accentColor + '60';

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 100).duration(400)}
      style={{ width: cardWidth }}>
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
        <LinearGradient
          colors={['transparent', gradientColor]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={[styles.cardBorderHighlight, { borderColor: highlightColor }]} />
        <View style={[styles.cardInnerGlow, { shadowColor: accentColor }]} />
        <View
          style={[
            styles.avatarContainer,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
              backgroundColor: avatarAsset ? 'transparent' : '#2a2a2a',
              borderColor: accentColor,
            },
          ]}>
          {avatarAsset ? (
            <Image
              source={avatarAsset}
              style={{
                width: avatarSize,
                height: avatarSize,
              }}
              resizeMode="contain"
            />
          ) : (
            <User size={avatarSize * 0.5} color="#999999" />
          )}
        </View>
        <Text style={styles.cardText}>{item.name}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  titlePortrait: {
    marginTop: 40,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    lineHeight: 40,
  },
  titleLandscape: {
    marginTop: 24,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    lineHeight: 36,
  },
  card: {
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(26, 26, 26, 0.6)',
    borderWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    overflow: 'hidden',
  },
  cardBorderHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  cardInnerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  avatarContainer: {
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
  },
  cardText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    marginBottom: 12,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  emptySubtitle: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    color: '#999999',
  },
  signOutContainer: {
    marginTop: 40,
    marginBottom: 20,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
