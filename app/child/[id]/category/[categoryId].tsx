import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLocalSearchParams, router } from 'expo-router';
import React, { useState, useMemo } from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Play, User, Search, X } from 'lucide-react-native';
import { getIconByName, getCategoryColor } from '@/lib/category-icons';
import { Icon } from '@/components/ui/icon';
import { getAvatarAsset } from '@/lib/avatar';

export default function CategoryVideosScreen() {
  const { id, categoryId } = useLocalSearchParams<{ id: string; categoryId: string }>();
  const child = useQuery(api.children.getChild, { childId: id as any });
  const category = useQuery(api.categories.getCategory, { categoryId: categoryId as any });
  const videos = useQuery(api.videos.listVideosByCategory, { categoryId: categoryId as any });
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [searchQuery, setSearchQuery] = useState('');

  const numColumns = isLandscape ? 3 : 2;
  const videoWidth = (width - (isLandscape ? 48 : 16) * (numColumns + 1)) / numColumns;
  const videoHeight = videoWidth * 0.75;

  const handleVideoPress = (videoId: string) => {
    router.replace(`/child/${id}/video/${videoId}`);
  };

  const handleBack = () => {
    router.back();
  };

  const filteredVideos = useMemo(() => {
    if (!videos) return [];
    if (!searchQuery.trim()) return videos;

    const query = searchQuery.toLowerCase().trim();
    return videos.filter((video: any) => video.title.toLowerCase().includes(query));
  }, [videos, searchQuery]);

  if (child === undefined || category === undefined || videos === undefined) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#322DE2" />
        </View>
      </SafeAreaView>
    );
  }

  if (!category) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Category not found</Text>
        <Button onPress={handleBack}>Go Back</Button>
      </SafeAreaView>
    );
  }

  const CategoryIcon = getIconByName(category.icon);
  const categoryColor = getCategoryColor(category);
  const avatarAsset = child ? getAvatarAsset(child.avatar) : null;
  const avatarSize = 28;

  const renderVideo = ({ item, index }: { item: any; index: number }) => {
    return (
      <VideoCard
        item={item}
        index={index}
        videoWidth={videoWidth}
        videoHeight={videoHeight}
        isLandscape={isLandscape}
        onPress={() => handleVideoPress(item._id)}
      />
    );
  };

  const showNoResults = searchQuery.trim() && filteredVideos.length === 0;

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <TouchableOpacity className="p-2" onPress={handleBack}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <View className="flex-row items-center gap-2">
            <Icon as={CategoryIcon} size={20} color={categoryColor} />
            <Text style={styles.headerTitle}>{category.title}</Text>
          </View>
          <View className="mt-1 flex-row items-center gap-2">
            {avatarAsset && (
              <View
                className="items-center justify-center overflow-hidden bg-[#2a2a2a]"
                style={{
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: avatarSize / 2,
                }}>
                <Image
                  source={avatarAsset}
                  style={{ width: avatarSize, height: avatarSize }}
                  resizeMode="contain"
                />
              </View>
            )}
            <Text style={styles.headerSubtitle}>{child?.name}'s Videos</Text>
          </View>
        </View>
        <View className="w-10" />
      </Animated.View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#999999" style={styles.searchIcon} />
          <Input
            placeholder="Search videos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor="#666666"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <X size={18} color="#999999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {videos.length === 0 ? (
        <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎬</Text>
          <Text style={styles.emptyTitle}>No videos yet</Text>
          <Text style={styles.emptySubtitle}>
            Ask your parent to add some videos to this category!
          </Text>
        </Animated.View>
      ) : showNoResults ? (
        <Animated.View entering={FadeInUp.duration(400)} style={styles.noResultsState}>
          <Search size={48} color="#666666" />
          <Text style={styles.noResultsTitle}>No videos found</Text>
          <Text style={styles.noResultsSubtitle}>Try a different search term</Text>
        </Animated.View>
      ) : (
        <FlatList
          data={filteredVideos}
          renderItem={renderVideo}
          keyExtractor={(item) => item._id}
          numColumns={numColumns}
          key={isLandscape ? 'landscape' : 'portrait'}
          contentContainerStyle={{
            padding: isLandscape ? 12 : 16,
          }}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            marginBottom: isLandscape ? 12 : 16,
            gap: isLandscape ? 12 : 16,
          }}
          style={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

function VideoCard({
  item,
  index,
  videoWidth,
  videoHeight,
  isLandscape,
  onPress,
}: {
  item: any;
  index: number;
  videoWidth: number;
  videoHeight: number;
  isLandscape: boolean;
  onPress: () => void;
}) {
  return (
    <Animated.View
      entering={FadeInUp.delay(index * 60).duration(400)}
      style={{ width: videoWidth }}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View
          style={{
            width: videoWidth,
            height: videoHeight,
            borderRadius: 12,
            backgroundColor: '#1a1a1a',
            overflow: 'hidden',
          }}>
          <Image source={{ uri: item.thumbnail }} style={{ width: '100%', height: '100%' }} />
          <View
            style={{
              position: 'absolute',
              inset: 0,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
            }}>
            <Play size={isLandscape ? 24 : 32} color="#ffffff" fill="#ffffff" />
          </View>
        </View>
        <Text
          style={{
            marginTop: isLandscape ? 6 : 8,
            fontWeight: '500',
            color: '#ffffff',
            fontSize: isLandscape ? 12 : 14,
            lineHeight: isLandscape ? 16 : 20,
          }}
          numberOfLines={2}>
          {item.title}
        </Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999999',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    color: '#ffffff',
    paddingHorizontal: 0,
    height: 44,
  },
  clearButton: {
    padding: 4,
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
  noResultsState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666666',
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
});
