import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLocalSearchParams, router } from 'expo-router';
import React, { useState, useMemo } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, X, ArrowLeft } from 'lucide-react-native';
import { VideoCard } from '@/components/VideoCard';

export default function SearchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const videos = useQuery(api.videos.listVideosByChild, { childId: id as any });
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVideos = useMemo(() => {
    if (!videos || !searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return videos.filter((video: any) => video.title.toLowerCase().includes(query));
  }, [videos, searchQuery]);

  const handleVideoPress = (videoId: string) => {
    router.push(`/child/${id}/video/${videoId}`);
  };

  const handleClose = () => {
    router.back();
  };

  const numColumns = isLandscape ? 3 : 2;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.backButton}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Videos</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={20} color="#999999" style={styles.searchIcon} />
          <TextInput
            placeholder="Search all videos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor="#666666"
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <X size={18} color="#999999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!searchQuery.trim() ? (
        <View style={styles.emptyState}>
          <Search size={48} color="#666666" />
          <Text style={styles.emptyText}>Type to search videos</Text>
        </View>
      ) : filteredVideos.length === 0 ? (
        <View style={styles.emptyState}>
          <Search size={48} color="#666666" />
          <Text style={styles.emptyText}>No videos found</Text>
          <Text style={styles.emptySubtext}>Try a different search term</Text>
        </View>
      ) : (
        <FlatList
          data={filteredVideos}
          keyExtractor={(item) => item._id}
          numColumns={numColumns}
          contentContainerStyle={{
            padding: isLandscape ? 12 : 16,
          }}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            marginBottom: isLandscape ? 12 : 16,
            gap: isLandscape ? 12 : 16,
          }}
          renderItem={({ item, index }) => (
            <VideoCard
              item={item}
              index={index}
              isLandscape={isLandscape}
              numColumns={numColumns}
              onPress={() => handleVideoPress(item._id)}
            />
          )}
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
    minHeight: 56,
  },
  backButton: {
    padding: 8,
    width: 44,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  searchInputWrapper: {
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
    color: '#ffffff',
    fontSize: 16,
    height: 44,
    padding: 0,
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
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
  },
});
