import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUserId, getCurrentUserIdOrThrow } from "./users";

export const createCategory = mutation({
  args: {
    childId: v.id("childProfiles"),
    title: v.string(),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const parentId = await getCurrentUserIdOrThrow(ctx);

    const child = await ctx.db.get(args.childId);
    if (!child || child.parentId !== parentId) {
      throw new Error("Child not found");
    }

    const existingCategories = await ctx.db
      .query("categories")
      .withIndex("by_child", (q) => q.eq("childId", args.childId))
      .collect();

    const maxOrder = existingCategories.reduce(
      (max, cat) => Math.max(max, cat.order),
      -1
    );

    const category = await ctx.db.insert("categories", {
      parentId,
      childId: args.childId,
      title: args.title,
      icon: args.icon,
      order: maxOrder + 1,
    });

    return category;
  },
});

export const updateCategory = mutation({
  args: {
    categoryId: v.id("categories"),
    title: v.string(),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const parentId = await getCurrentUserIdOrThrow(ctx);

    const category = await ctx.db.get(args.categoryId);
    if (!category || category.parentId !== parentId) {
      throw new Error("Category not found");
    }

    await ctx.db.patch(args.categoryId, {
      title: args.title,
      icon: args.icon,
    });

    return args.categoryId;
  },
});

export const deleteCategory = mutation({
  args: {
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    const parentId = await getCurrentUserIdOrThrow(ctx);

    const category = await ctx.db.get(args.categoryId);
    if (!category || category.parentId !== parentId) {
      throw new Error("Category not found");
    }

    const videos = await ctx.db
      .query("videos")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    for (const video of videos) {
      await ctx.db.delete(video._id);
    }

    await ctx.db.delete(args.categoryId);

    return args.categoryId;
  },
});

export const reorderCategories = mutation({
  args: {
    childId: v.id("childProfiles"),
    categoryIds: v.array(v.id("categories")),
  },
  handler: async (ctx, args) => {
    const parentId = await getCurrentUserIdOrThrow(ctx);

    const child = await ctx.db.get(args.childId);
    if (!child || child.parentId !== parentId) {
      throw new Error("Child not found");
    }

    for (let i = 0; i < args.categoryIds.length; i++) {
      const category = await ctx.db.get(args.categoryIds[i]);
      if (!category || category.parentId !== parentId) {
        throw new Error("Category not found");
      }
      await ctx.db.patch(args.categoryIds[i], { order: i });
    }

    return true;
  },
});

export const listCategoriesByChild = query({
  args: {
    childId: v.id("childProfiles"),
  },
  handler: async (ctx, args) => {
    const parentId = await getCurrentUserId(ctx);
    if (!parentId) return [];

    const child = await ctx.db.get(args.childId);
    if (!child || child.parentId !== parentId) {
      return [];
    }

    const categories = await ctx.db
      .query("categories")
      .withIndex("by_child_and_order", (q) =>
        q.eq("childId", args.childId)
      )
      .order("asc")
      .collect();

    return categories;
  },
});

export const getCategory = query({
  args: {
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    const parentId = await getCurrentUserId(ctx);
    if (!parentId) return null;

    const category = await ctx.db.get(args.categoryId);
    if (!category || category.parentId !== parentId) {
      return null;
    }

    return category;
  },
});
