import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLocalSearchParams, router } from 'expo-router';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { ArrowLeft, X } from 'lucide-react-native';
import { useState } from 'react';

export default function VideoPlayerScreen() {
  const { id, videoId } = useLocalSearchParams<{ id: string; videoId: string }>();
  const video = useQuery(api.videos.getVideo, { videoId: videoId as any });
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const handleBack = () => {
    router.back();
  };

  const getYouTubeEmbedUrl = (youtubeVideoId: string) => {
    return (
      `https://www.youtube.com/embed/${youtubeVideoId}?` +
      `autoplay=1&` +
      `rel=0&` +
      `playsinline=0&` +
      `enablejsapi=1&` +
      `disablekb=1&` +
      `loop=0&` +
      `controls=0&` +
      `modestbranding=1&` +
      `&iv_load_policy=3&` +
      `color=white&` +
      `fs=1&` +
      `origin=*`
    );
  };

  if (video === undefined) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#ffffff" />
      </SafeAreaView>
    );
  }

  if (!video) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Video not found</Text>
        <TouchableOpacity style={styles.backButtonLarge} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(video.youtubeVideoId);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />

      {/* Header - hidden in landscape for immersive experience */}
      {!isLandscape && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={28} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {video.title}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleBack}>
            <X size={28} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Video Player */}
      <View style={[styles.videoContainer, isLandscape && styles.videoContainerLandscape]}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Loading video...</Text>
          </View>
        )}

        {hasError ? (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorEmoji}>😕</Text>
            <Text style={styles.errorTitle}>Couldn't load video</Text>
            <Text style={styles.errorSubtext}>There was a problem playing this video.</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => setHasError(false)}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            source={{
              uri: embedUrl,
              headers: { Referer: 'https://example.com' },
            }}
            style={styles.webview}
            // allowsFullscreenVideo
            // mediaPlaybackRequiresUserAction={false}
            // javaScriptEnabled
            // domStorageEnabled
            // startInLoadingState
            originWhitelist={['*']}
            scrollEnabled={false}
            allowsFullscreenVideo={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback={true}
            cacheEnabled={false}
            setSupportMultipleWindows={false}
            androidLayerType="hardware"
            backgroundColor="#000"
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            renderLoading={() => (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={styles.loadingText}>Loading video...</Text>
              </View>
            )}
          />
        )}
      </View>

      {/* Back button overlay in landscape mode */}
      {isLandscape && (
        <TouchableOpacity style={styles.landscapeBackButton} onPress={handleBack}>
          <X size={24} color="#ffffff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
    backgroundColor: '#0f0f0f',
  },
  backButton: {
    padding: 8,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoContainerLandscape: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 12,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0f0f0f',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 20,
  },
  backButtonLarge: {
    backgroundColor: '#322DE2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#322DE2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  landscapeBackButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 24,
    zIndex: 100,
  },
});
