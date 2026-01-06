import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Download, Info, RotateCcw } from "lucide-react";
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
import { toast } from "sonner"; // Using sonner for toasts
import { useWorkoutData } from "@/hooks/useWorkoutData";
import { useActivityData } from "@/hooks/useActivityData"; // Import the new hook

export default function SettingsPage() {
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const { restoreFactorySettings: restoreWorkoutFactorySettings } = useWorkoutData();
  const { restoreActivityFactorySettings } = useActivityData(); // Use the new hook

  const handleExportData = () => {
    const data = {
      templates: localStorage.getItem("fittrack_templates"),
      sessions: localStorage.getItem("fittrack_sessions"),
      exercises: localStorage.getItem("fittrack_exercises"),
      recipes: localStorage.getItem("fittrack_recipes"),
      activityData: localStorage.getItem("fittrack_activity_data"), // Export new activity data
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fittrack-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Data exported", {
      description: "Your data has been downloaded as a JSON file.",
    });
  };

  const handleClearAllData = () => {
    localStorage.removeItem("fittrack_templates");
    localStorage.removeItem("fittrack_sessions");
    localStorage.removeItem("fittrack_exercises");
    localStorage.removeItem("fittrack_recipes");
    localStorage.removeItem("fittrack_active_session");
    localStorage.removeItem("fittrack_activity_data"); // Clear new activity data
    
    setClearAllDialogOpen(false);
    
    toast.success("Data cleared", {
      description: "All your data has been deleted. Refreshing app...",
    });

    // Reload after a short delay to allow toast to be seen
    setTimeout(() => window.location.reload(), 500);
  };

  const handleRestoreFactorySettings = () => {
    restoreWorkoutFactorySettings();
    restoreActivityFactorySettings(); // Restore activity data
    setRestoreDialogOpen(false);
    toast.success("Factory settings restored", {
      description: "All data has been reset to default. Refreshing app...",
    });
    // Reload after a short delay to allow toast to be seen
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your app preferences</p>
      </div>

      <div className="space-y-4">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Download all your workout data, templates, and recipes as a JSON file.
            </p>
            <Button onClick={handleExportData} variant="outline">
              Download Backup
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-warning/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-warning">
              <RotateCcw className="h-5 w-5" />
              Restore Factory Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Reset all your custom data (templates, sessions, exercises, recipes, and activities) to the app's original default settings.
            </p>
            <Button
              onClick={() => setRestoreDialogOpen(true)}
              variant="outline"
              className="text-warning border-warning hover:bg-warning/10"
            >
              Restore Defaults
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-destructive/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Clear All Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Permanently delete all your data. This action cannot be undone.
            </p>
            <Button
              onClick={() => setClearAllDialogOpen(true)}
              variant="destructive"
            >
              Clear All Data
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-5 w-5" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p className="text-foreground font-medium">FitTrack PWA</p>
              <p className="text-muted-foreground">Version 1.0.0</p>
              <p className="text-muted-foreground">
                Personal fitness tracker for workouts and recipes.
                All data is stored locally on your device.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={clearAllDialogOpen} onOpenChange={setClearAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Data</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your workout history, templates, recipes, and logged activities.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAllData}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Factory Settings</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore factory settings? This will delete all your custom templates, workout sessions, custom exercises, recipes, and logged activities, replacing them with the app's original defaults.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestoreFactorySettings}
              className="bg-warning text-warning-foreground hover:bg-warning/90"
            >
              Restore Defaults
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}