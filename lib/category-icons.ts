import {
  GraduationCap,
  Tv,
  Music,
  Atom,
  Palette,
  Trophy,
  Cat,
  BookOpen,
  Video,
  School,
  Gamepad2,
  Film,
  type LucideIcon,
} from 'lucide-react-native';

// Map of Lucide icon names to their components
const iconMap: Record<string, LucideIcon> = {
  GraduationCap,
  Tv,
  Music,
  Atom,
  Palette,
  Trophy,
  Cat,
  BookOpen,
  Video,
  School,
  Gamepad2,
  Film,
};

/**
 * Get the Lucide icon component by name
 * @param iconName - The name of the Lucide icon (e.g., "GraduationCap", "Video")
 * @returns The Lucide icon component, defaults to Video if not found
 */
export function getIconByName(iconName: string | undefined): LucideIcon {
  if (!iconName) return Video;
  return iconMap[iconName] || Video;
}

/**
 * Default colors for the predefined categories
 */
export const defaultCategoryColors = {
  Learning: '#3b82f6', // blue
  Entertainment: '#8b5cf6', // purple
  Music: '#ec4899', // pink
  Science: '#22c55e', // green
  'Art & Crafts': '#f59e0b', // amber
  Sports: '#ef4444', // red
  Animals: '#14b8a6', // teal
  Stories: '#f97316', // orange
  School: '#14d97d', // mint
  Gaming: '#ed3a3aff', // red
  Movies: '#ec4899', // pink
};

/**
 * Get the color for a category
 * @param category - The category object from the API
 * @returns The hex color code for the category
 */
export function getCategoryColor(category: any): string {
  // If category has a color field, use it
  if (category.color) {
    return category.color;
  }

  // Fallback to default gray for custom categories without color
  return '#6b7280';
}

/**
 * Get the icon name for a category
 * @param category - The category object from the API
 * @returns The Lucide icon name
 */
export function getCategoryIconName(category: any): string {
  // If category has an icon field, use it
  if (category.icon) {
    return category.icon;
  }

  // Default to Video for custom categories without icon
  return 'Video';
}

/**
 * Check if a category is custom (user-created)
 * @param category - The category object from the API
 * @returns true if the category is custom
 */
export function isCustomCategory(category: any): boolean {
  // If isCustom is explicitly set, use it
  if (typeof category.isCustom === 'boolean') {
    return category.isCustom;
  }

  // If no predefinedCategoryId, treat as custom
  return !category.predefinedCategoryId;
}
