import React from 'react';
import { TouchableOpacity, View, Image, Text, useWindowDimensions } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Play } from 'lucide-react-native';

type VideoCardProps = {
  item: {
    _id: string;
    title: string;
    thumbnail: string;
  };
  onPress: () => void;
  isLandscape: boolean;
  numColumns?: number;
  index?: number;
};

export function VideoCard({ item, onPress, isLandscape, numColumns = 2, index }: VideoCardProps) {
  const { width } = useWindowDimensions();
  const padding = isLandscape ? 24 : 32;
  const gap = isLandscape ? 12 : 16;
  const videoWidth = (width - padding - gap * (numColumns - 1)) / numColumns;
  const videoHeight = videoWidth * 0.75;

  const content = (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{ width: videoWidth }}>
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
  );

  if (index !== undefined) {
    return (
      <Animated.View entering={FadeInUp.delay(index * 60).duration(400)}>{content}</Animated.View>
    );
  }

  return content;
}
