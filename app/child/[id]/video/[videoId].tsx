import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLocalSearchParams, router } from 'expo-router';
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { ArrowLeft, X } from 'lucide-react-native';
import { useState } from 'react';
import { Text } from '@/components/ui/text';

export default function VideoPlayerScreen() {
  const { id, videoId } = useLocalSearchParams<{ id: string; videoId: string }>();
  const video = useQuery(api.videos.getVideo, { videoId: videoId as any });
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [alreadyOpened, setAlreadyOpened] = useState(false);
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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#322DE2" />
        </View>
      </SafeAreaView>
    );
  }

  if (!video) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Video not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(video.youtubeVideoId);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />

      <View style={styles.videoContainer}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color="#322DE2" />
              <Text style={styles.loadingText}>Loading video...</Text>
            </View>
          </View>
        )}

        {hasError ? (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorEmoji}>😕</Text>
            <Text style={styles.errorTitle}>Couldn't load video</Text>
            <Text style={styles.errorSubtext}>There was a problem playing this video.</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => setHasError(false)}>
              <Text style={styles.backButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <WebView
              source={{
                uri: embedUrl,
                headers: { Referer: 'https://example.com' },
              }}
              style={styles.webview}
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
              onLoadStart={() => {
                setIsLoading(true);
                console.warn('Video load started');
              }}
              onLoadEnd={() => {
                setIsLoading(false);
                console.warn('Video load ended');

                setTimeout(() => {
                  setAlreadyOpened(true);
                }, 3000);
              }}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
            {alreadyOpened && (
              <View style={styles.alreadyOpenedContent}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    gap: 12,
                  }}
                  onPress={handleBack}>
                  <ArrowLeft size={28} color="#ffffff" />
                  <Text className="text-muted-foreground">Tap to close</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f0f0f',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  videoContainer: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    backgroundColor: '#000000',
  },
  loadingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 12,
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0f0f0f',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorSubtext: {
    color: '#999999',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 18,
    marginBottom: 20,
  },
  backButton: {
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
  webview: {
    width: 1,
    height: 1,
    opacity: 0,
  },
  landscapeBackButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 24,
    zIndex: 50,
  },
  alreadyOpenedContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0f0f0f',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
});
