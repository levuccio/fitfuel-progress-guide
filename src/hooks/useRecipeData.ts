import { useLocalStorage } from "./useLocalStorage";
import { Recipe } from "@/types/recipe";
import { defaultRecipes } from "@/data/recipes";
import { useCallback } from "react";

const RECIPES_KEY = "fittrack_recipes";

export function useRecipeData() {
  const [recipes, setRecipes] = useLocalStorage<Recipe[]>(RECIPES_KEY, defaultRecipes);

  const addRecipe = useCallback((recipe: Recipe) => {
    setRecipes(prev => [...prev, recipe]);
  }, [setRecipes]);

  const updateRecipe = useCallback((recipe: Recipe) => {
    setRecipes(prev => prev.map(r => r.id === recipe.id ? recipe : r));
  }, [setRecipes]);

  const deleteRecipe = useCallback((recipeId: string) => {
    setRecipes(prev => prev.filter(r => r.id !== recipeId));
  }, [setRecipes]);

  return {
    recipes,
    addRecipe,
    updateRecipe,
    deleteRecipe,
  };
}
