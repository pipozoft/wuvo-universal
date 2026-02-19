import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLocalSearchParams, router } from 'expo-router';
import {
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
import { cn } from '@/lib/utils';

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
      <SafeAreaView className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#ffffff" />
      </SafeAreaView>
    );
  }

  if (!video) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black">
        <Text className="mb-5 text-lg text-white">Video not found</Text>
        <TouchableOpacity className="rounded-lg bg-[#322DE2] px-6 py-3" onPress={handleBack}>
          <Text className="text-base font-semibold text-white">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(video.youtubeVideoId);

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar hidden />

      {!isLandscape && (
        <View className="flex-row items-center justify-between bg-[#0f0f0f] px-4 py-3">
          <TouchableOpacity className="p-2" onPress={handleBack}>
            <ArrowLeft size={28} color="#ffffff" />
          </TouchableOpacity>
          <Text
            className="mx-4 flex-1 text-center text-base font-semibold text-white"
            numberOfLines={1}>
            {video.title}
          </Text>
          <TouchableOpacity className="p-2" onPress={handleBack}>
            <X size={28} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}

      <View className="flex-1 bg-black">
        {isLoading && (
          <View className="absolute inset-0 z-10 items-center justify-center bg-black">
            <ActivityIndicator size="large" color="#ffffff" />
            <Text className="mt-3 text-base text-white">Loading video...</Text>
          </View>
        )}

        {hasError ? (
          <View className="absolute inset-0 items-center justify-center bg-[#0f0f0f] px-10">
            <Text className="mb-4 text-6xl">😕</Text>
            <Text className="mb-2 text-xl font-bold text-white">Couldn't load video</Text>
            <Text className="mb-6 text-center text-sm text-[#999999]">
              There was a problem playing this video.
            </Text>
            <TouchableOpacity
              className="rounded-lg bg-[#322DE2] px-6 py-3"
              onPress={() => setHasError(false)}>
              <Text className="text-base font-semibold text-white">Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            source={{
              uri: embedUrl,
              headers: { Referer: 'https://example.com' },
            }}
            className="flex-1 bg-black"
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
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        )}
      </View>

      {isLandscape && (
        <TouchableOpacity
          className="absolute top-4 right-4 z-50 rounded-full bg-black/50 p-3"
          onPress={handleBack}>
          <X size={24} color="#ffffff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
