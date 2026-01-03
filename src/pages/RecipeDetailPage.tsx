import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useRecipeData } from "@/hooks/useRecipeData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Clock, Flame, Users } from "lucide-react";

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { recipes } = useRecipeData();
  
  const recipe = recipes.find(r => r.id === id);
  const [servings, setServings] = useState(recipe?.servings || 1); // Initialize with recipe's servings or 1

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">Recipe not found</h3>
        <Button onClick={() => navigate("/recipes")} variant="outline">
          Back to Recipes
        </Button>
      </div>
    );
  }

  const scaledIngredients = recipe.ingredients.map(ing => ({
    ...ing,
    amount: ing.amount * (servings / recipe.servings), // Scale based on original servings
  }));

  const scaledMacros = {
    calories: recipe.macrosPerServing.calories * (servings / recipe.servings),
    protein: recipe.macrosPerServing.protein * (servings / recipe.servings),
    carbs: recipe.macrosPerServing.carbs * (servings / recipe.servings),
    fat: recipe.macrosPerServing.fat * (servings / recipe.servings),
    fiber: (recipe.macrosPerServing.fiber || 0) * (servings / recipe.servings),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/recipes")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{recipe.name}</h1>
          <p className="text-muted-foreground">{recipe.description}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{recipe.prepTime + recipe.cookTime} min</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <Select value={servings.toString()} onValueChange={(v) => setServings(parseInt(v))}>
            <SelectTrigger className="w-24 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <SelectItem key={n} value={n.toString()}>
                  {n} {n === 1 ? "serving" : "servings"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Nutrition ({servings} serving{servings > 1 ? "s" : ""})</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 bg-secondary/50 rounded-lg text-center">
              <div className="text-lg font-bold text-foreground">{scaledMacros.calories.toFixed(0)}</div>
              <div className="text-xs text-muted-foreground">Calories</div>
            </div>
            <div className="p-3 bg-secondary/50 rounded-lg text-center">
              <div className="text-lg font-bold text-foreground">{scaledMacros.protein.toFixed(1)}g</div>
              <div className="text-xs text-muted-foreground">Protein</div>
            </div>
            <div className="p-3 bg-secondary/50 rounded-lg text-center">
              <div className="text-lg font-bold text-foreground">{scaledMacros.carbs.toFixed(1)}g</div>
              <div className="text-xs text-muted-foreground">Carbs</div>
            </div>
            <div className="p-3 bg-secondary/50 rounded-lg text-center">
              <div className="text-lg font-bold text-foreground">{scaledMacros.fat.toFixed(1)}g</div>
              <div className="text-xs text-muted-foreground">Fat</div>
            </div>
            <div className="p-3 bg-secondary/50 rounded-lg text-center">
              <div className="text-lg font-bold text-foreground">{scaledMacros.fiber.toFixed(1)}g</div>
              <div className="text-xs text-muted-foreground">Fiber</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground mb-3">Ingredients</h3>
          <ul className="space-y-2">
            {scaledIngredients.map((ing) => (
              <li key={ing.id} className="flex items-center gap-2 text-sm">
                <span className="w-16 text-right font-medium text-foreground">
                  {ing.amount % 1 === 0 ? ing.amount : ing.amount.toFixed(1)} {ing.unit}
                </span>
                <span className="text-muted-foreground">{ing.name}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground mb-3">Instructions</h3>
          <ol className="space-y-3">
            {recipe.instructions.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-medium flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-sm text-muted-foreground pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}