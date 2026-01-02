import { useNavigate } from "react-router-dom";
import { useRecipeData } from "@/hooks/useRecipeData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Clock, Flame, UtensilsCrossed } from "lucide-react";

export default function RecipesPage() {
  const navigate = useNavigate();
  const { recipes } = useRecipeData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Recipes</h1>
          <p className="text-muted-foreground">Healthy meals for your fitness goals</p>
        </div>
        <Button variant="outline" className="gap-2" disabled>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Recipe</span>
        </Button>
      </div>

      {recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <UtensilsCrossed className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No recipes yet</h3>
          <p className="text-muted-foreground max-w-sm">
            Add your favorite healthy recipes to track macros.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {recipes.map((recipe) => (
            <Card
              key={recipe.id}
              className="glass-card cursor-pointer hover:border-primary/50 transition-all"
              onClick={() => navigate(`/recipes/${recipe.id}`)}
            >
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground">{recipe.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {recipe.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{recipe.prepTime + recipe.cookTime} min</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Flame className="h-4 w-4" />
                    <span>{recipe.macrosPerServing.calories} cal</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 p-2 bg-secondary/50 rounded-lg text-center">
                    <div className="text-sm font-semibold text-foreground">
                      {recipe.macrosPerServing.protein}g
                    </div>
                    <div className="text-xs text-muted-foreground">Protein</div>
                  </div>
                  <div className="flex-1 p-2 bg-secondary/50 rounded-lg text-center">
                    <div className="text-sm font-semibold text-foreground">
                      {recipe.macrosPerServing.carbs}g
                    </div>
                    <div className="text-xs text-muted-foreground">Carbs</div>
                  </div>
                  <div className="flex-1 p-2 bg-secondary/50 rounded-lg text-center">
                    <div className="text-sm font-semibold text-foreground">
                      {recipe.macrosPerServing.fat}g
                    </div>
                    <div className="text-xs text-muted-foreground">Fat</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {recipe.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
