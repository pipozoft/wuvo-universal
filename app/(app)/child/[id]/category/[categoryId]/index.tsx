import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLocalSearchParams, router } from 'expo-router';
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
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, User } from 'lucide-react-native';
import { cn } from '@/lib/utils';
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

  const numColumns = isLandscape ? 3 : 2;
  const videoWidth = (width - (isLandscape ? 48 : 16) * (numColumns + 1)) / numColumns;
  const videoHeight = videoWidth * 0.75;

  const handleVideoPress = (videoId: string) => {
    router.push(`/child/${id}/video/${videoId}`);
  };

  const handleBack = () => {
    router.back();
  };

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
        <Text className="mb-5 text-lg text-white">Category not found</Text>
        <Button onPress={handleBack}>Go Back</Button>
      </SafeAreaView>
    );
  }

  const CategoryIcon = getIconByName(category.icon);
  const categoryColor = getCategoryColor(category);
  const avatarAsset = child ? getAvatarAsset(child.avatar) : null;
  const avatarSize = 28;

  const renderVideo = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        className="active:opacity-70"
        style={{ width: videoWidth }}
        onPress={() => handleVideoPress(item._id)}
        activeOpacity={0.7}>
        <View
          className="relative overflow-hidden rounded-xl bg-[#1a1a1a]"
          style={{ width: videoWidth, height: videoHeight }}>
          <Image source={{ uri: item.thumbnail }} className="h-full w-full" />
          <View className="absolute inset-0 items-center justify-center bg-black/40">
            <Play size={isLandscape ? 24 : 32} color="#ffffff" fill="#ffffff" />
          </View>
        </View>
        <Text
          className={cn(
            'mt-2 font-medium text-white',
            isLandscape ? 'mt-1.5 text-xs leading-4' : 'text-sm leading-5'
          )}
          numberOfLines={2}>
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity className="p-2" onPress={handleBack}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <View className="flex-row items-center gap-2">
            <Icon as={CategoryIcon} size={20} color={categoryColor} />
            <Text className="text-sm font-bold text-white">{category.title}</Text>
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
            <Text className="text-sm text-[#999999]">{child?.name}'s Videos</Text>
          </View>
        </View>
        <View className="w-10" />
      </View>

      {videos.length === 0 ? (
        <View style={styles.emptyState}>
          <Text className="mb-4 text-6xl">🎬</Text>
          <Text className="mb-3 text-2xl font-bold text-white">No videos yet</Text>
          <Text className="px-10 text-center text-base text-[#999999]">
            Ask your parent to add some videos to this category!
          </Text>
        </View>
      ) : (
        <FlatList
          data={videos}
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  list: {
    flex: 1,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
