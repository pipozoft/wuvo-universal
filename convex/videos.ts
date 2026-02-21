import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { getCurrentUserId, getCurrentUserIdOrThrow } from './users';

export const addVideo = mutation({
  args: {
    childId: v.id('childProfiles'),
    categoryId: v.id('categories'),
    youtubeVideoId: v.string(),
    title: v.string(),
    thumbnail: v.string(),
  },
  handler: async (ctx, args) => {
    const parentId = await getCurrentUserIdOrThrow(ctx);

    const child = await ctx.db.get(args.childId);
    if (!child || child.parentId !== parentId) {
      throw new Error('Child not found');
    }

    const category = await ctx.db.get(args.categoryId);
    if (!category || category.parentId !== parentId) {
      throw new Error('Category not found');
    }

    const existingVideos = await ctx.db
      .query('videos')
      .withIndex('by_category', (q) => q.eq('categoryId', args.categoryId))
      .collect();

    const maxOrder = existingVideos.reduce((max, vid) => Math.max(max, vid.order), -1);

    const video = await ctx.db.insert('videos', {
      parentId,
      childId: args.childId,
      categoryId: args.categoryId,
      youtubeVideoId: args.youtubeVideoId,
      title: args.title,
      thumbnail: args.thumbnail,
      order: maxOrder + 1,
    });

    return video;
  },
});

export const updateVideo = mutation({
  args: {
    videoId: v.id('videos'),
    title: v.string(),
    thumbnail: v.string(),
    categoryId: v.optional(v.id('categories')),
  },
  handler: async (ctx, args) => {
    const parentId = await getCurrentUserIdOrThrow(ctx);

    const video = await ctx.db.get(args.videoId);
    if (!video || video.parentId !== parentId) {
      throw new Error('Video not found');
    }

    if (args.categoryId) {
      const category = await ctx.db.get(args.categoryId);
      if (!category || category.parentId !== parentId) {
        throw new Error('Category not found');
      }
      await ctx.db.patch(args.videoId, {
        title: args.title,
        thumbnail: args.thumbnail,
        categoryId: args.categoryId,
      });
    } else {
      await ctx.db.patch(args.videoId, {
        title: args.title,
        thumbnail: args.thumbnail,
      });
    }

    return args.videoId;
  },
});

export const deleteVideo = mutation({
  args: {
    videoId: v.id('videos'),
  },
  handler: async (ctx, args) => {
    const parentId = await getCurrentUserIdOrThrow(ctx);

    const video = await ctx.db.get(args.videoId);
    if (!video || video.parentId !== parentId) {
      throw new Error('Video not found');
    }

    await ctx.db.delete(args.videoId);

    return args.videoId;
  },
});

export const reorderVideos = mutation({
  args: {
    categoryId: v.id('categories'),
    videoIds: v.array(v.id('videos')),
  },
  handler: async (ctx, args) => {
    const parentId = await getCurrentUserIdOrThrow(ctx);

    const category = await ctx.db.get(args.categoryId);
    if (!category || category.parentId !== parentId) {
      throw new Error('Category not found');
    }

    for (let i = 0; i < args.videoIds.length; i++) {
      const video = await ctx.db.get(args.videoIds[i]);
      if (!video || video.parentId !== parentId) {
        throw new Error('Video not found');
      }
      await ctx.db.patch(args.videoIds[i], { order: i });
    }

    return true;
  },
});

export const listVideosByCategory = query({
  args: {
    categoryId: v.id('categories'),
  },
  handler: async (ctx, args) => {
    const parentId = await getCurrentUserId(ctx);
    if (!parentId) return [];

    const category = await ctx.db.get(args.categoryId);
    if (!category || category.parentId !== parentId) {
      return [];
    }

    const videos = await ctx.db
      .query('videos')
      .withIndex('by_category_and_order', (q) => q.eq('categoryId', args.categoryId))
      .order('asc')
      .collect();

    return videos;
  },
});

export const getVideo = query({
  args: {
    videoId: v.id('videos'),
  },
  handler: async (ctx, args) => {
    const parentId = await getCurrentUserId(ctx);
    if (!parentId) return null;

    const video = await ctx.db.get(args.videoId);
    if (!video || video.parentId !== parentId) {
      return null;
    }

    return video;
  },
});

export const listVideosByChild = query({
  args: {
    childId: v.id('childProfiles'),
  },
  handler: async (ctx, args) => {
    const parentId = await getCurrentUserId(ctx);
    if (!parentId) return [];

    const child = await ctx.db.get(args.childId);
    if (!child || child.parentId !== parentId) {
      return [];
    }

    const videos = await ctx.db
      .query('videos')
      .withIndex('by_child', (q) => q.eq('childId', args.childId))
      .collect();

    return videos;
  },
});
