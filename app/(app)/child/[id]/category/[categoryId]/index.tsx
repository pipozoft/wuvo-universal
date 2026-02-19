import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLocalSearchParams, router } from 'expo-router';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Image,
  useWindowDimensions,
} from 'react-native';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play } from 'lucide-react-native';

export default function CategoryVideosScreen() {
  const { id, categoryId } = useLocalSearchParams<{ id: string; categoryId: string }>();
  const child = useQuery(api.children.getChild, { childId: id as any });
  const category = useQuery(api.categories.getCategory, { categoryId: categoryId as any });
  const videos = useQuery(api.videos.listVideosByCategory, { categoryId: categoryId as any });
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  // Calculate video dimensions based on orientation
  const numColumns = isLandscape ? 4 : 2;
  const videoWidth = (width - 16 * (numColumns + 1)) / numColumns;
  const videoHeight = videoWidth * 0.75;

  const handleVideoPress = (videoId: string) => {
    router.push(`/child/${id}/video/${videoId}`);
  };

  const handleBack = () => {
    router.back();
  };

  if (child === undefined || category === undefined || videos === undefined) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#322DE2" />
      </SafeAreaView>
    );
  }

  if (!category) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Category not found</Text>
        <Button onPress={handleBack}>Go Back</Button>
      </SafeAreaView>
    );
  }

  const renderVideo = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        style={[styles.videoCard, { width: videoWidth }]}
        onPress={() => handleVideoPress(item._id)}
        activeOpacity={0.7}
      >
        <View style={[styles.thumbnailContainer, { width: videoWidth, height: videoHeight }]}>
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
          <View style={styles.playOverlay}>
            <Play size={isLandscape ? 24 : 32} color="#ffffff" fill="#ffffff" />
          </View>
        </View>
        <Text style={[styles.videoTitle, isLandscape && styles.videoTitleLandscape]} numberOfLines={2}>
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{category.title}</Text>
          <Text style={styles.headerSubtitle}>{child?.name}'s Videos</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {videos.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎬</Text>
          <Text style={styles.emptyTitle}>No videos yet</Text>
          <Text style={styles.emptyText}>
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
          contentContainerStyle={[
            styles.videosList,
            isLandscape && styles.videosListLandscape,
          ]}
          columnWrapperStyle={[
            styles.videoRow,
            isLandscape && styles.videoRowLandscape,
          ]}
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999999',
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  videosList: {
    padding: 16,
  },
  videosListLandscape: {
    padding: 12,
  },
  videoRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  videoRowLandscape: {
    marginBottom: 12,
  },
  videoCard: {},
  thumbnailContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginTop: 8,
    lineHeight: 20,
  },
  videoTitleLandscape: {
    fontSize: 12,
    marginTop: 6,
    lineHeight: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 20,
  },
});
