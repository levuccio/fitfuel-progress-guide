import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkoutData } from "@/hooks/useWorkoutData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { WorkoutTemplate, TemplateExercise } from "@/types/workout";
import { useToast } from "@/hooks/use-toast";

const REP_PRESETS = ["6-8", "8-10", "6-10", "8-12", "10-12", "12-15", "15-20", "AMRAP"];

function normalizeRepsInput(val: string) {
  return val.trim().replace(/–/g, "-").replace(/\s*to\s*/gi, "-");
}

export default function TemplateBuilderPage() {
  const navigate = useNavigate();
  const { addTemplate } = useWorkoutData();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<TemplateExercise[]>([]);

  const addExercise = () => {
    setExercises(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: "",
        sets: 3,
        repRange: "8-10",
        restSeconds: 180,
      },
    ]);
  };

  const updateExercise = (id: string, field: keyof TemplateExercise, value: any) => {
    setExercises(prev => prev.map(ex => (ex.id === id ? { ...ex, [field]: value } : ex)));
  };

  const removeExercise = (id: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== id));
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast({ title: "Template name required" });
      return;
    }
    const template: WorkoutTemplate = {
      id: crypto.randomUUID(),
      name,
      exercises,
    };
    addTemplate(template);
    toast({ title: "Template created!" });
    navigate("/workouts");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Template</h1>

      <div>
        <Label>Template name</Label>
        <Input
          placeholder="e.g., Push Day"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {exercises.map((ex, idx) => (
          <Card key={ex.id}>
            <CardContent className="space-y-2 pt-4">
              <div className="flex items-center justify-between">
                <Label>Exercise {idx + 1}</Label>
                <Button variant="ghost" size="icon" onClick={() => removeExercise(ex.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <Input
                placeholder="Exercise name (type anything)"
                value={ex.name}
                onChange={e => updateExercise(ex.id, "name", e.target.value)}
              />

              <div className="flex gap-2">
                <Input
                  placeholder="Sets"
                  type="number"
                  min={1}
                  value={ex.sets}
                  onChange={e => updateExercise(ex.id, "sets", Number(e.target.value))}
                />

                <Select
                  onValueChange={v => updateExercise(ex.id, "repRange", normalizeRepsInput(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={ex.repRange} />
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

              <Input
                placeholder="Rest (sec)"
                type="number"
                min={30}
                value={ex.restSeconds}
                onChange={e => updateExercise(ex.id, "restSeconds", Number(e.target.value))}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={addExercise} className="w-full" variant="outline">
        <Plus className="w-4 h-4 mr-1" /> Add Exercise
      </Button>

      <Button onClick={handleSave} className="w-full">
        Save Template
      </Button>
    </div>
  );
}
