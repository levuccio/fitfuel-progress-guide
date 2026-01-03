"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Play, Clock, Dumbbell, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useWorkoutData } from "@/hooks/useWorkoutData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PausedSessionBanner } from "@/components/workout/PausedSessionBanner";
import { WorkoutTemplate } from "@/types/workout";

export default function WorkoutsPage() {
  const navigate = useNavigate();
  const { templates, activeSession, deleteTemplate, resumeSession, discardSession } = useWorkoutData();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<WorkoutTemplate | null>(null);

  const handleStartWorkout = (templateId: string) => {
    navigate(`/workout/${templateId}`);
  };

  const handleDeleteTemplate = (template: WorkoutTemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      deleteTemplate(templateToDelete.id);
      setTemplateToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const getTotalSets = (template: WorkoutTemplate) => {
    return template.exercises.reduce((acc, ex) => acc + ex.sets, 0);
  };

  const getEstimatedTime = (template: WorkoutTemplate) => {
    const totalRestSeconds = template.exercises.reduce(
      (acc, ex) => acc + (ex.sets * ex.restSeconds),
      0
    );
    const workingTime = template.exercises.length * 3 * 60; // ~3 min per exercise
    const totalMinutes = Math.round((totalRestSeconds + workingTime) / 60);
    return totalMinutes;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workouts</h1>
          <p className="text-muted-foreground">Choose a workout to start training</p>
        </div>
        <Button onClick={() => navigate("/template/new")} className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Template</span>
        </Button>
      </div>

      {activeSession && (
        <PausedSessionBanner
          session={activeSession}
          onContinue={() => {
            resumeSession();
            navigate(`/workout/${activeSession.templateId}`);
          }}
          onDiscard={discardSession}
        />
      )}

      <div className="grid gap-4 grid-cols-2">
        {templates.map((template) => (
          <Card key={template.id} className="glass-card group hover:border-primary/50 transition-all min-w-0">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="space-y-1">
                {template.dayOfWeek && (
                  <span className="text-xs font-medium text-primary uppercase tracking-wide">
                    {template.dayOfWeek}
                  </span>
                )}
                <CardTitle className="text-lg">{template.name}</CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate(`/template/${template.id}/edit`)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  {template.isCustom && (
                    <DropdownMenuItem
                      onClick={() => handleDeleteTemplate(template)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Dumbbell className="h-4 w-4" />
                  <span>{template.exercises.length} exercises</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>{getTotalSets(template)} sets</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>~{getEstimatedTime(template)} min</span>
                </div>
              </div>
              <Button
                onClick={() => handleStartWorkout(template.id)}
                className="w-full gap-2"
                disabled={!!activeSession}
              >
                <Play className="h-4 w-4" />
                Start Workout
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{templateToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}