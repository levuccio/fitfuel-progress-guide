import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWorkoutData } from "@/hooks/useWorkoutData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react";
import { WorkoutTemplate, TemplateExercise } from "@/types/workout";
import { useToast } from "@/hooks/use-toast";

export default function TemplateBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { templates, allExercises, addTemplate, updateTemplate } = useWorkoutData();

  const existingTemplate = id ? templates.find(t => t.id === id) : null;
  
  const [name, setName] = useState(existingTemplate?.name || "");
  const [dayOfWeek, setDayOfWeek] = useState(existingTemplate?.dayOfWeek || "");
  const [exercises, setExercises] = useState<TemplateExercise[]>(existingTemplate?.exercises || []);

  const addExercise = (exerciseId: string) => {
    const exercise = allExercises.find(e => e.id === exerciseId);
    if (!exercise) return;
    
    const newExercise: TemplateExercise = {
      id: crypto.randomUUID(),
      exerciseId,
      exercise,
      sets: 3,
      reps: "10",
      restSeconds: 120,
      order: exercises.length + 1,
    };
    setExercises([...exercises, newExercise]);
  };

  const updateExercise = (id: string, updates: Partial<TemplateExercise>) => {
    setExercises(exercises.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(e => e.id !== id));
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast({ title: "Error", description: "Please enter a template name", variant: "destructive" });
      return;
    }
    if (exercises.length === 0) {
      toast({ title: "Error", description: "Add at least one exercise", variant: "destructive" });
      return;
    }

    const template: WorkoutTemplate = {
      id: existingTemplate?.id || crypto.randomUUID(),
      name: name.trim(),
      dayOfWeek: dayOfWeek || undefined,
      exercises,
      isCustom: true,
      createdAt: existingTemplate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingTemplate) {
      updateTemplate(template);
      toast({ title: "Template updated" });
    } else {
      addTemplate(template);
      toast({ title: "Template created" });
    }
    navigate("/");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">{existingTemplate ? "Edit Template" : "New Template"}</h1>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Template Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Push Day" />
        </div>

        <div className="space-y-2">
          <Label>Day (optional)</Label>
          <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
            <SelectTrigger><SelectValue placeholder="Select day" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No specific day</SelectItem>
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Weekend"].map(d => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Exercises</Label>
        {exercises.map((ex, idx) => (
          <Card key={ex.id} className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{ex.exercise.name}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeExercise(ex.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">Sets</Label>
                      <Input type="number" value={ex.sets} onChange={(e) => updateExercise(ex.id, { sets: parseInt(e.target.value) || 1 })} />
                    </div>
                    <div>
                      <Label className="text-xs">Reps</Label>
                      <Input value={ex.reps} onChange={(e) => updateExercise(ex.id, { reps: e.target.value })} placeholder="8-12" />
                    </div>
                    <div>
                      <Label className="text-xs">Rest (s)</Label>
                      <Input type="number" value={ex.restSeconds} onChange={(e) => updateExercise(ex.id, { restSeconds: parseInt(e.target.value) || 60 })} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Select onValueChange={addExercise}>
          <SelectTrigger className="border-dashed">
            <Plus className="h-4 w-4 mr-2" />
            <span>Add Exercise</span>
          </SelectTrigger>
          <SelectContent>
            {allExercises.map(ex => (
              <SelectItem key={ex.id} value={ex.id}>{ex.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleSave} className="w-full">Save Template</Button>
    </div>
  );
}
