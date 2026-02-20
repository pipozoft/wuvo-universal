import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLocalSearchParams, router } from 'expo-router';
import React from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  Image,
  StyleSheet,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User } from 'lucide-react-native';
import { getIconByName, getCategoryColor, isCustomCategory } from '@/lib/category-icons';
import { Icon } from '@/components/ui/icon';
import { getAvatarAsset } from '@/lib/avatar';

export default function ChildCategoriesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const child = useQuery(api.children.getChild, { childId: id as any });
  const categories = useQuery(api.categories.listCategoriesByChild, { childId: id as any });
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/child/${id}/category/${categoryId}`);
  };

  const handleBack = () => {
    router.back();
  };

  if (child === undefined || categories === undefined) {
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
        <Button onPress={handleBack}>Go Back</Button>
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
        <TouchableOpacity className="p-2" onPress={handleBack}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <View className="flex-row items-center gap-3">
          <View
            className="items-center justify-center overflow-hidden bg-[#2a2a2a]"
            style={{
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
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
          <Text style={styles.headerTitle}>{child.name}'s Library</Text>
        </View>
        <View className="w-10" />
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
    </SafeAreaView>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
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
});
