export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
}

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  ingredients: Ingredient[];
  instructions: string[];
  macrosPerServing: Macros;
  tags: string[];
  isCustom: boolean;
  createdAt: string;
}
