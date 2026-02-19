import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUserId, getCurrentUserIdOrThrow } from "./users";

export const createChild = mutation({
  args: {
    name: v.string(),
    avatar: v.optional(v.string()),
    pin: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const parentId = await getCurrentUserIdOrThrow(ctx);

    const child = await ctx.db.insert("childProfiles", {
      parentId,
      name: args.name,
      avatar: args.avatar,
      pin: args.pin,
    });

    return child;
  },
});

export const updateChild = mutation({
  args: {
    childId: v.id("childProfiles"),
    name: v.string(),
    avatar: v.optional(v.string()),
    pin: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const parentId = await getCurrentUserIdOrThrow(ctx);

    const child = await ctx.db.get(args.childId);
    if (!child || child.parentId !== parentId) {
      throw new Error("Child not found");
    }

    await ctx.db.patch(args.childId, {
      name: args.name,
      avatar: args.avatar,
      pin: args.pin,
    });

    return args.childId;
  },
});

export const deleteChild = mutation({
  args: {
    childId: v.id("childProfiles"),
  },
  handler: async (ctx, args) => {
    const parentId = await getCurrentUserIdOrThrow(ctx);

    const child = await ctx.db.get(args.childId);
    if (!child || child.parentId !== parentId) {
      throw new Error("Child not found");
    }

    const categories = await ctx.db
      .query("categories")
      .withIndex("by_child", (q) => q.eq("childId", args.childId))
      .collect();

    for (const category of categories) {
      const videos = await ctx.db
        .query("videos")
        .withIndex("by_category", (q) => q.eq("categoryId", category._id))
        .collect();

      for (const video of videos) {
        await ctx.db.delete(video._id);
      }

      await ctx.db.delete(category._id);
    }

    await ctx.db.delete(args.childId);

    return args.childId;
  },
});

export const listChildren = query({
  handler: async (ctx) => {
    const parentId = await getCurrentUserId(ctx);
    if (!parentId) return [];

    const children = await ctx.db
      .query("childProfiles")
      .withIndex("by_parent", (q) => q.eq("parentId", parentId))
      .collect();

    return children;
  },
});

export const getChild = query({
  args: {
    childId: v.id("childProfiles"),
  },
  handler: async (ctx, args) => {
    const parentId = await getCurrentUserId(ctx);
    if (!parentId) return null;

    const child = await ctx.db.get(args.childId);
    if (!child || child.parentId !== parentId) {
      return null;
    }

    return child;
  },
});
