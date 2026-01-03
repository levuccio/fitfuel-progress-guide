import { Recipe } from "@/types/recipe";

export const defaultRecipes: Recipe[] = [
  {
    id: "overnight-oats",
    name: "Overnight Oats with Chia, Cottage Cheese & Protein Powder",
    description: "High-protein overnight oats packed with fiber and healthy fats. Perfect for meal prep!",
    prepTime: 10,
    cookTime: 0,
    servings: 1, // Changed to 1 serving, as macrosPerServing is for one serving
    ingredients: [
      { id: "1", name: "Rolled oats", amount: 75, unit: "g" },
      { id: "2", name: "Chia seeds", amount: 15, unit: "g" },
      { id: "3", name: "Cottage cheese", amount: 95, unit: "g" },
      { id: "4", name: "Milk (any type)", amount: 175, unit: "ml" },
      { id: "5", name: "Protein powder", amount: 20, unit: "g" }, // Added protein powder
    ],
    instructions: [
      "In a jar or container, combine oats, chia seeds, and protein powder.",
      "Add milk and stir well to combine. Let sit for 2 minutes, then stir again.",
      "Add cottage cheese on top (or mix in if you prefer).",
      "Cover and refrigerate overnight (or at least 4 hours).",
      "Enjoy cold or microwave for 1-2 minutes if you prefer warm oats.",
    ],
    macrosPerServing: {
      calories: 399, // Adjusted macros
      protein: 39,   // Adjusted macros
      carbs: 30,     // Adjusted macros
      fat: 13,       // Adjusted macros
      fiber: 8,      // Adjusted macros
    },
    tags: ["breakfast", "meal-prep", "high-protein"], // Removed 'vegetarian'
    isCustom: false,
    createdAt: new Date().toISOString(),
  },
];