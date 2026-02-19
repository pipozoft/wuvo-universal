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
  useWindowDimensions,
} from 'react-native';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react-native';

const CATEGORY_ICONS: Record<string, string> = {
  '🎵': '🎵',
  '🎨': '🎨',
  '🎮': '🎮',
  '📚': '📚',
  '🎬': '🎬',
  '🎪': '🎪',
  '🦁': '🦁',
  '🚀': '🚀',
  '🌈': '🌈',
  '⭐': '⭐',
};

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
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#322DE2" />
      </SafeAreaView>
    );
  }

  if (!child) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Profile not found</Text>
        <Button onPress={handleBack}>Go Back</Button>
      </SafeAreaView>
    );
  }

  const renderCategory = ({ item }: { item: any }) => {
    const icon = item.icon || '⭐';

    return (
      <TouchableOpacity
        style={[
          styles.categoryCard,
          isLandscape && styles.categoryCardLandscape,
        ]}
        onPress={() => handleCategoryPress(item._id)}
        activeOpacity={0.7}
      >
        <Text style={[styles.categoryIcon, isLandscape && styles.categoryIconLandscape]}>
          {icon}
        </Text>
        <Text style={styles.categoryTitle}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{child.name}'s Shows</Text>
        <View style={styles.placeholder} />
      </View>

      {categories.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📺</Text>
          <Text style={styles.emptyTitle}>No categories yet</Text>
          <Text style={styles.emptyText}>
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
          contentContainerStyle={[
            styles.categoriesList,
            isLandscape && styles.categoriesListLandscape,
          ]}
          columnWrapperStyle={[
            styles.categoryRow,
            isLandscape && styles.categoryRowLandscape,
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  categoriesList: {
    padding: 20,
  },
  categoriesListLandscape: {
    padding: 16,
  },
  categoryRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryRowLandscape: {
    marginBottom: 12,
  },
  categoryCard: {
    flex: 1,
    marginHorizontal: 8,
    aspectRatio: 1.2,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  categoryCardLandscape: {
    aspectRatio: 1.5,
    padding: 16,
  },
  categoryIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  categoryIconLandscape: {
    fontSize: 40,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
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
