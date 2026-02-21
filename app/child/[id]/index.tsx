import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLocalSearchParams, router } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  Image,
  StyleSheet,
  Text,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Button } from '@/components/ui/button';
import { User, Search } from 'lucide-react-native';
import { getIconByName, getCategoryColor } from '@/lib/category-icons';
import { Icon } from '@/components/ui/icon';
import { getAvatarAsset } from '@/lib/avatar';

export default function ChildCategoriesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const child = useQuery(api.children.getChild, { childId: id as any });
  const categories = useQuery(api.categories.listCategoriesByChild, { childId: id as any });
  const children = useQuery(api.children.listChildren);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/child/${id}/category/${categoryId}`);
  };

  const handleSearchPress = () => {
    router.push(`/child/${id}/search`);
  };

  const handleSwitchProfile = (childId: string) => {
    setProfileModalVisible(false);
    router.replace(`/child/${childId}`);
  };

  const handleExitToHome = () => {
    setProfileModalVisible(false);
    router.replace('/');
  };

  if (child === undefined || categories === undefined || children === undefined) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#322DE2" />
        </View>
      </SafeAreaView>
    );
  }

  if (!child) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Profile not found</Text>
        <Button onPress={() => router.replace('/')}>Go Home</Button>
      </SafeAreaView>
    );
  }

  const avatarAsset = getAvatarAsset(child.avatar);
  const avatarSize = 40;

  const renderCategory = ({ item, index }: { item: any; index: number }) => {
    return (
      <CategoryCard
        item={item}
        index={index}
        isLandscape={isLandscape}
        onPress={() => handleCategoryPress(item._id)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <TouchableOpacity
          className="p-2"
          onPress={() => setProfileModalVisible(true)}
          activeOpacity={0.7}>
          <View
            className="items-center justify-center overflow-hidden bg-[#2a2a2a]"
            style={{
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
              borderWidth: 2,
              borderColor: '#322DE2',
            }}>
            {avatarAsset ? (
              <Image
                source={avatarAsset}
                style={{ width: avatarSize, height: avatarSize }}
                resizeMode="contain"
              />
            ) : (
              <User size={avatarSize * 0.5} color="#999999" />
            )}
          </View>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{child.name}'s Library</Text>

        <TouchableOpacity className="p-2" onPress={handleSearchPress}>
          <Search size={24} color="#ffffff" />
        </TouchableOpacity>
      </Animated.View>

      {categories.length === 0 ? (
        <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📺</Text>
          <Text style={styles.emptyTitle}>No categories yet</Text>
          <Text style={styles.emptySubtitle}>
            Ask your parent to add some video categories for you!
          </Text>
        </Animated.View>
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item._id}
          numColumns={isLandscape ? 4 : 2}
          key={isLandscape ? 'landscape' : 'portrait'}
          contentContainerStyle={{
            padding: isLandscape ? 16 : 20,
          }}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            marginBottom: isLandscape ? 12 : 16,
          }}
          style={styles.list}
        />
      )}

      <ProfileSwitcherModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        children={children}
        currentChildId={id}
        onSwitchProfile={handleSwitchProfile}
        onExitToHome={handleExitToHome}
      />
    </SafeAreaView>
  );
}

function ProfileSwitcherModal({
  visible,
  onClose,
  children,
  currentChildId,
  onSwitchProfile,
  onExitToHome,
}: {
  visible: boolean;
  onClose: () => void;
  children: any[];
  currentChildId: string;
  onSwitchProfile: (childId: string) => void;
  onExitToHome: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.modalTitle}>Switch Profile</Text>

          <View style={styles.profilesGrid}>
            {children.map((item) => {
              const avatarAsset = getAvatarAsset(item.avatar);
              const isCurrentProfile = item._id === currentChildId;

              return (
                <TouchableOpacity
                  key={item._id}
                  style={[styles.profileItem, isCurrentProfile && styles.profileItemActive]}
                  onPress={() => onSwitchProfile(item._id)}
                  disabled={isCurrentProfile}
                  activeOpacity={0.7}>
                  <View
                    style={[
                      styles.profileAvatar,
                      {
                        borderColor: isCurrentProfile ? '#322DE2' : '#444444',
                        backgroundColor: avatarAsset ? 'transparent' : '#2a2a2a',
                      },
                    ]}>
                    {avatarAsset ? (
                      <Image
                        source={avatarAsset}
                        style={{ width: 48, height: 48 }}
                        resizeMode="contain"
                      />
                    ) : (
                      <User size={24} color="#999999" />
                    )}
                  </View>
                  <Text style={[styles.profileName, isCurrentProfile && styles.profileNameActive]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.exitButton} onPress={onExitToHome}>
            <Text style={styles.exitButtonText}>Exit to Home</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function CategoryCard({
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
  const IconComponent = getIconByName(item.icon);
  const color = getCategoryColor(item);

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 80).duration(400)}
      style={{
        marginHorizontal: 8,
        flex: 1,
      }}>
      <TouchableOpacity
        style={[
          {
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            borderRadius: 16,
            backgroundColor: '#1a1a1a',
            borderWidth: 2,
            borderColor: color,
          },
          isLandscape ? { aspectRatio: 1.5, padding: 16 } : { aspectRatio: 1.2, padding: 20 },
        ]}
        onPress={onPress}
        activeOpacity={0.7}>
        <Icon as={IconComponent} size={isLandscape ? 40 : 48} color={color} />
        <Text style={styles.cardText}>{item.title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#999999',
    paddingHorizontal: 40,
  },
  cardText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  list: {
    flex: 1,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  profilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  profileItem: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
    minWidth: 80,
  },
  profileItemActive: {
    backgroundColor: '#322DE2',
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  profileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  profileNameActive: {
    fontWeight: '600',
  },
  exitButton: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
  },
  exitButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
});
