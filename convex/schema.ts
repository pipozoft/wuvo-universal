import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  childProfiles: defineTable({
    parentId: v.string(), // Clerk user ID
    name: v.string(),
    avatar: v.optional(v.string()),
    pin: v.optional(v.string()),
  })
    .index("by_parent", ["parentId"])
    .index("by_parent_and_name", ["parentId", "name"]),

  categories: defineTable({
    parentId: v.string(), // Clerk user ID
    childId: v.id("childProfiles"),
    title: v.string(),
    icon: v.optional(v.string()),
    order: v.number(),
  })
    .index("by_child", ["childId"])
    .index("by_parent", ["parentId"])
    .index("by_child_and_order", ["childId", "order"]),

  videos: defineTable({
    parentId: v.string(), // Clerk user ID
    childId: v.id("childProfiles"),
    categoryId: v.id("categories"),
    youtubeVideoId: v.string(),
    title: v.string(),
    thumbnail: v.string(),
    order: v.number(),
  })
    .index("by_category", ["categoryId"])
    .index("by_child", ["childId"])
    .index("by_parent", ["parentId"])
    .index("by_category_and_order", ["categoryId", "order"]),
});
