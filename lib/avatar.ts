/**
 * Avatar utility functions for Wuvo TV app
 *
 * Maps avatar paths from the API to local assets
 * Avatar paths look like: "/little-monsters-avatar-set/avatar-5.png"
 */

import { ImageSourcePropType } from 'react-native';

// Map of avatar paths to local assets
const avatarAssets: Record<string, ImageSourcePropType> = {
  '/little-monsters-avatar-set/avatar-1.png': require('@/assets/images/little-monsters-avatar-set/avatar-1.png'),
  '/little-monsters-avatar-set/avatar-2.png': require('@/assets/images/little-monsters-avatar-set/avatar-2.png'),
  '/little-monsters-avatar-set/avatar-3.png': require('@/assets/images/little-monsters-avatar-set/avatar-3.png'),
  '/little-monsters-avatar-set/avatar-4.png': require('@/assets/images/little-monsters-avatar-set/avatar-4.png'),
  '/little-monsters-avatar-set/avatar-5.png': require('@/assets/images/little-monsters-avatar-set/avatar-5.png'),
  '/little-monsters-avatar-set/avatar-6.png': require('@/assets/images/little-monsters-avatar-set/avatar-6.png'),
  '/little-monsters-avatar-set/avatar-7.png': require('@/assets/images/little-monsters-avatar-set/avatar-7.png'),
  '/little-monsters-avatar-set/avatar-8.png': require('@/assets/images/little-monsters-avatar-set/avatar-8.png'),
  '/little-monsters-avatar-set/avatar-9.png': require('@/assets/images/little-monsters-avatar-set/avatar-9.png'),
  '/little-monsters-avatar-set/avatar-10.png': require('@/assets/images/little-monsters-avatar-set/avatar-10.png'),
  '/little-monsters-avatar-set/avatar-11.png': require('@/assets/images/little-monsters-avatar-set/avatar-11.png'),
  '/little-monsters-avatar-set/avatar-12.png': require('@/assets/images/little-monsters-avatar-set/avatar-12.png'),
  '/little-monsters-avatar-set/avatar-13.png': require('@/assets/images/little-monsters-avatar-set/avatar-13.png'),
  '/little-monsters-avatar-set/avatar-14.png': require('@/assets/images/little-monsters-avatar-set/avatar-14.png'),
  '/little-monsters-avatar-set/avatar-15.png': require('@/assets/images/little-monsters-avatar-set/avatar-15.png'),
  '/little-monsters-avatar-set/avatar-16.png': require('@/assets/images/little-monsters-avatar-set/avatar-16.png'),
  '/little-monsters-avatar-set/avatar-17.png': require('@/assets/images/little-monsters-avatar-set/avatar-17.png'),
  '/little-monsters-avatar-set/avatar-18.png': require('@/assets/images/little-monsters-avatar-set/avatar-18.png'),
};

/**
 * Get the local avatar asset from the avatar path
 * @param avatarPath - The path from the API (e.g., "/little-monsters-avatar-set/avatar-5.png")
 * @returns The local image require or null if not found
 */
export function getAvatarAsset(avatarPath: string | undefined | null): ImageSourcePropType | null {
  if (!avatarPath) return null;
  return avatarAssets[avatarPath] || null;
}

/**
 * Get the avatar filename from the path
 * @param avatarPath - The full path
 * @returns Just the filename (e.g., "avatar-5.png")
 */
export function getAvatarFilename(avatarPath: string | undefined): string | null {
  if (!avatarPath) return null;
  return avatarPath.split('/').pop() || null;
}

/**
 * Extract avatar number from path
 * @param avatarPath - The full path
 * @returns The avatar number (e.g., 5 from "/little-monsters-avatar-set/avatar-5.png")
 */
export function getAvatarNumber(avatarPath: string | undefined): number | null {
  const filename = getAvatarFilename(avatarPath);
  if (!filename) return null;

  const match = filename.match(/avatar-(\d+)\.png/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Legacy function - kept for compatibility but now returns null
 * Use getAvatarAsset() instead for local assets
 */
export function getAvatarUrl(avatarPath: string | undefined | null): string | null {
  // Return null since we're using local assets now
  return null;
}

// Kept for backwards compatibility
export const AVATAR_BASE_URL = 'local-assets';
