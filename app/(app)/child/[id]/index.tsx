import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLocalSearchParams, router } from 'expo-router';
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { getIconByName, getCategoryColor, isCustomCategory } from '@/lib/category-icons';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
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
      <SafeAreaView className="flex-1 items-center justify-center bg-[#0f0f0f]">
        <ActivityIndicator size="large" color="#322DE2" />
      </SafeAreaView>
    );
  }

  if (!child) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#0f0f0f]">
        <Text className="mb-5 text-lg text-white">Profile not found</Text>
        <Button onPress={handleBack}>Go Back</Button>
      </SafeAreaView>
    );
  }

  const avatarAsset = getAvatarAsset(child.avatar);
  const avatarSize = 40;

  const renderCategory = ({ item }: { item: any }) => {
    const IconComponent = getIconByName(item.icon);
    const color = getCategoryColor(item);
    const isCustom = isCustomCategory(item);

    return (
      <TouchableOpacity
        className={cn(
          'mx-2 flex-1 items-center justify-center gap-3 rounded-2xl bg-[#1a1a1a]',
          isLandscape ? 'aspect-[1.5] p-4' : 'aspect-[1.2] p-5'
        )}
        style={{ borderColor: color, borderWidth: 2 }}
        onPress={() => handleCategoryPress(item._id)}
        activeOpacity={0.7}>
        <Icon
          as={IconComponent}
          size={isLandscape ? 40 : 48}
          color={color}
          className={cn(isLandscape ? 'mb-2' : 'mb-3')}
        />
        <Text className="text-md text-center font-semibold text-white">{item.title}</Text>
        {isCustom && <Text className="mt-1 text-xs text-[#6b7280]">Custom</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0f0f0f]">
      <View className="flex-row items-center justify-between border-b border-[#1a1a1a] px-5 py-4">
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
          <Text className="text-xl font-bold text-white">{child.name}'s Library</Text>
        </View>
        <View className="w-10" />
      </View>

      {categories.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <Text className="mb-4 text-6xl leading-16">📺</Text>
          <Text className="mb-3 text-2xl font-bold text-white">No categories yet</Text>
          <Text className="text-center text-base text-[#999999]">
            Ask your parent to add some video categories for you!
          </Text>
        </View>
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
        />
      )}
    </SafeAreaView>
  );
}
