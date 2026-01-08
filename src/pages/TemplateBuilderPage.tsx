import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWorkoutData } from "@/hooks/useWorkoutData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { WorkoutTemplate, TemplateExercise, Exercise } from "@/types/workout";
import { useToast } from "@/hooks/use-toast";

const REP_PRESETS = ["6-8", "8-10", "6-10", "8-12", "10-12", "12-15", "15-20", "AMRAP"];

// Local type for exercises in the builder, before conversion to TemplateExercise
interface BuilderExercise {
  id: string; // Local ID for React keys
  exerciseName: string; // User-typed name
  sets: number;
  reps: string; // Matches TemplateExercise 'reps'
  restSeconds: number;
  category: "weights" | "abs" | "cardio" | "other";
}

function normalizeRepsInput(val: string) {
  return val.trim().replace(/–/g, "-").replace(/\s*to\s*/gi, "-");
}

export default function TemplateBuilderPage() {
  const navigate = useNavigate();
  const { id: templateId } = useParams<{ id: string }>();
  const { addTemplate, updateTemplate, addExercise, allExercises, getTemplateById } = useWorkoutData();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [builderExercises, setBuilderExercises] = useState<BuilderExercise[]>([]);
  const isEditing = !!templateId;

  useEffect(() => {
    if (isEditing && templateId) {
      const existingTemplate = getTemplateById(templateId);
      if (existingTemplate) {
        setName(existingTemplate.name);
        setBuilderExercises(
          existingTemplate.exercises.map(ex => ({
            id: ex.id, // Use existing ID for builder, or generate new if needed
            exerciseName: ex.exercise.name,
            sets: ex.sets,
            reps: ex.reps,
            restSeconds: ex.restSeconds,
            category: ex.exercise.category || "weights",
          }))
        );
      } else {
        toast({ title: "Template not found", description: "The template you tried to edit does not exist." });
        navigate("/");
      }
    }
  }, [isEditing, templateId, getTemplateById, navigate, toast]);

  const addBuilderExercise = () => {
    setBuilderExercises(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        exerciseName: "",
        sets: 3,
        reps: "8-10",
        restSeconds: 180,
        category: "weights",
      },
    ]);
  };

  const updateBuilderExercise = (id: string, field: keyof BuilderExercise, value: any) => {
    setBuilderExercises(prev => prev.map(ex => (ex.id === id ? { ...ex, [field]: value } : ex)));
  };

  const removeBuilderExercise = (id: string) => {
    setBuilderExercises(prev => prev.filter(ex => ex.id !== id));
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast({ title: "Template name required", description: "Please give your workout template a name." });
      return;
    }
    if (builderExercises.length === 0) {
      toast({ title: "No exercises added", description: "Please add at least one exercise to your template." });
      return;
    }
    if (builderExercises.some(ex => !ex.exerciseName.trim())) {
      toast({ title: "Missing exercise name", description: "All exercises must have a name." });
      return;
    }

    const templateExercises: TemplateExercise[] = [];
    const newCustomExercises: Exercise[] = [];

    builderExercises.forEach((bEx, index) => {
      let exercise = allExercises.find(e => e.name.toLowerCase() === bEx.exerciseName.toLowerCase());

      if (!exercise) {
        // Create a new custom exercise if it doesn't exist
        const newExercise: Exercise = {
          id: crypto.randomUUID(),
          name: bEx.exerciseName,
          description: `Custom exercise: ${bEx.exerciseName}`,
          targetMuscles: ["N/A"], // Default for custom exercises
          equipment: ["N/A"], // Default for custom exercises
          isCustom: true,
          category: bEx.category,
        };
        newCustomExercises.push(newExercise);
        exercise = newExercise;
      }

      templateExercises.push({
        id: bEx.id, // Use existing builder ID for consistency, or generate new if it's a new exercise in an existing template
        exerciseId: exercise.id,
        exercise: exercise,
        sets: bEx.sets,
        reps: bEx.reps,
        restSeconds: bEx.restSeconds,
        order: index + 1,
      });
    });

    // Add any newly created custom exercises to the global list
    newCustomExercises.forEach(ex => addExercise(ex));

    if (isEditing && templateId) {
      const updatedTemplate: WorkoutTemplate = {
        id: templateId,
        name,
        exercises: templateExercises,
        isCustom: true, // Always true for editable templates
        createdAt: getTemplateById(templateId)?.createdAt || new Date().toISOString(), // Preserve original creation date
        updatedAt: new Date().toISOString(),
      };
      updateTemplate(updatedTemplate);
      toast({ title: "Template updated!", description: `"${name}" has been saved.` });
    } else {
      const newTemplate: WorkoutTemplate = {
        id: crypto.randomUUID(),
        name,
        exercises: templateExercises,
        isCustom: true, // Templates created here are custom
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addTemplate(newTemplate);
      toast({ title: "Template created!", description: `"${name}" has been saved.` });
    }

    navigate("/");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">
          {isEditing ? "Edit Template" : "New Template"}
        </h1>
      </div>

      <div>
        <Label htmlFor="template-name">Template name</Label>
        <Input
          id="template-name"
          placeholder="e.g., Push Day"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {builderExercises.map((bEx, idx) => (
          <Card key={bEx.id} className="glass-card">
            <CardContent className="space-y-2 pt-4">
              <div className="flex items-center justify-between">
                <Label>Exercise {idx + 1}</Label>
                <Button variant="ghost" size="icon" onClick={() => removeBuilderExercise(bEx.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <Input
                placeholder="Exercise name (type anything)"
                value={bEx.exerciseName}
                onChange={e => updateBuilderExercise(bEx.id, "exerciseName", e.target.value)}
              />

              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor={`sets-${bEx.id}`} className="sr-only">Sets</Label>
                  <Input
                    id={`sets-${bEx.id}`}
                    placeholder="Sets"
                    type="number"
                    min={1}
                    value={bEx.sets}
                    onChange={e => updateBuilderExercise(bEx.id, "sets", Number(e.target.value))}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor={`reps-${bEx.id}`} className="sr-only">Reps</Label>
                  <Select
                    value={bEx.reps}
                    onValueChange={v => updateBuilderExercise(bEx.id, "reps", normalizeRepsInput(v))}
                  >
                    <SelectTrigger id={`reps-${bEx.id}`}>
                      <SelectValue placeholder="Reps" />
                    </SelectTrigger>
                    <SelectContent>
                      {REP_PRESETS.map(preset => (
                        <SelectItem key={preset} value={preset}>
                          {preset}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex-1">
                <Label htmlFor={`rest-${bEx.id}`} className="sr-only">Rest (seconds)</Label>
                <Input
                  id={`rest-${bEx.id}`}
                  placeholder="Rest (sec)"
                  type="number"
                  min={30}
                  value={bEx.restSeconds}
                  onChange={e => updateBuilderExercise(bEx.id, "restSeconds", Number(e.target.value))}
                />
              </div>

              <div className="flex-1">
                <Label htmlFor={`category-${bEx.id}`} className="sr-only">Category</Label>
                <Select
                  value={bEx.category}
                  onValueChange={v => updateBuilderExercise(bEx.id, "category", v)}
                >
                  <SelectTrigger id={`category-${bEx.id}`}>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weights">Weights</SelectItem>
                    <SelectItem value="abs">Abs</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={addBuilderExercise} className="w-full" variant="outline">
        <Plus className="w-4 h-4 mr-1" /> Add Exercise
      </Button>

      <Button onClick={handleSave} className="w-full">
        {isEditing ? "Update Template" : "Save Template"}
      </Button>
    </div>
  );
}