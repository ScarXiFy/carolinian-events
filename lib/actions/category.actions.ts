// lib/actions/category.actions.ts
"use server"

import { connectToDatabase } from "@/lib/database/connect"
import Category from "@/lib/database/models/category.model"
import { revalidatePath } from "next/cache"
import { handleError } from "@/lib/utils" // Assuming you have an error utility

// CREATE
export async function createCategory(name: string, description?: string) {
  try {
    await connectToDatabase()

    const newCategory = await Category.create({
      name,
      description
    })

    return JSON.parse(JSON.stringify(newCategory))
  } catch (error) {
    handleError(error)
  }
}

// READ
export async function getAllCategories(): Promise<Array<{
  _id: string;
  name: string;
}>> {
  try {
    await connectToDatabase();
    const categories = await Category.find()
      .select('_id name') // Only get necessary fields
      .lean();

    // Filter out categories with empty names
    const validCategories = categories.filter(cat => 
      cat.name && typeof cat.name === 'string' && cat.name.trim() !== ''
    );

    return JSON.parse(JSON.stringify(validCategories.map(cat => ({
      _id: (cat._id as string | { toString(): string }).toString(),
      name: (cat.name as string).trim()
    }))));
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
}

export async function getCategoryById(categoryId: string) {
  try {
    await connectToDatabase()

    const category = await Category.findById(categoryId).lean()

    if (!category) throw new Error("Category not found")

    return JSON.parse(JSON.stringify(category))
  } catch (error) {
    handleError(error)
  }
}

export async function getCategoryByName(name: string) {
  try {
    await connectToDatabase()

    const category = await Category.findOne({ name }).lean()

    if (!category) throw new Error("Category not found")

    return JSON.parse(JSON.stringify(category))
  } catch (error) {
    handleError(error)
  }
}

// UPDATE
export async function updateCategory(
  categoryId: string,
  updates: { name?: string; description?: string }
) {
  try {
    await connectToDatabase()

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      updates,
      { new: true } // Return the updated document
    ).lean()

    if (!updatedCategory) throw new Error("Category update failed")

    revalidatePath("/") // Update cached data as needed
    return JSON.parse(JSON.stringify(updatedCategory))
  } catch (error) {
    handleError(error)
  }
}

// DELETE
export async function deleteCategory(categoryId: string) {
  try {
    await connectToDatabase()

    // // Optional: Check if any events are using this category
    // const eventsCount = await Event.countDocuments({ category: categoryId })
    // if (eventsCount > 0) {
    //   throw new Error(
    //     "Cannot delete category with associated events. Reassign events first."
    //   )
    // }

    const deletedCategory = await Category.findByIdAndDelete(categoryId)

    if (!deletedCategory) throw new Error("Category not found")

    revalidatePath("/") // Update cached data as needed
    return { success: true }
  } catch (error) {
    handleError(error)
  }
}

// UTILITY FUNCTIONS
export async function getCategoriesWithEventCount() {
  try {
    await connectToDatabase()

    const categories = await Category.aggregate([
      {
        $lookup: {
          from: "events", // MongoDB collection name
          localField: "_id",
          foreignField: "category",
          as: "events"
        }
      },
      {
        $project: {
          name: 1,
          description: 1,
          eventCount: { $size: "$events" }
        }
      },
      { $sort: { name: 1 } }
    ])

    return JSON.parse(JSON.stringify(categories))
  } catch (error) {
    handleError(error)
  }
}

export async function getPopularCategories(limit = 5) {
  try {
    await connectToDatabase()

    const popularCategories = await Category.aggregate([
      {
        $lookup: {
          from: "events",
          localField: "_id",
          foreignField: "category",
          as: "events"
        }
      },
      {
        $project: {
          name: 1,
          eventCount: { $size: "$events" }
        }
      },
      { $sort: { eventCount: -1 } },
      { $limit: limit }
    ])

    return JSON.parse(JSON.stringify(popularCategories))
  } catch (error) {
    handleError(error)
  }
}