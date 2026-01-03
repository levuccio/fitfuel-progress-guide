import { Recipe } from "@/types/recipe";

export const defaultRecipes: Recipe[] = [
  {
    id: "overnight-oats",
    name: "Overnight Oats with Chia, Cottage Cheese & Kiwi",
    description: "High-protein overnight oats packed with fiber and healthy fats. Perfect for meal prep!",
    prepTime: 10,
    cookTime: 0,
    servings: 1,
    ingredients: [
      { id: "1", name: "Rolled oats", amount: 75, unit: "g" },
      { id: "2", name: "Chia seeds", amount: 15, unit: "g" },
      { id: "3", name: "Cottage cheese", amount: 95, unit: "g" },
      { id: "4", name: "Milk (any type)", amount: 175, unit: "ml" },
      { id: "5", name: "Kiwi", amount: 1, unit: "medium" },
      { id: "6", name: "Honey or maple syrup", amount: 1, unit: "tbsp" },
      { id: "7", name: "Vanilla extract", amount: 0.5, unit: "tsp" },
    ],
    instructions: [
      "In a jar or container, combine oats, chia seeds, and vanilla extract.",
      "Add milk and stir well to combine. Let sit for 2 minutes, then stir again.",
      "Add cottage cheese on top (or mix in if you prefer).",
      "Cover and refrigerate overnight (or at least 4 hours).",
      "In the morning, peel and dice the kiwi.",
      "Top oats with kiwi and drizzle with honey.",
      "Enjoy cold or microwave for 1-2 minutes if you prefer warm oats.",
    ],
    macrosPerServing: {
      calories: 425,
      protein: 24,
      carbs: 55,
      fat: 12,
      fiber: 10,
    },
    tags: ["breakfast", "meal-prep", "high-protein", "vegetarian"],
    isCustom: false,
    createdAt: new Date().toISOString(),
  },
];
