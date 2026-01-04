import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import WorkoutsPage from "./pages/WorkoutsPage";
import HistoryPage from "./pages/HistoryPage";
import ProgressPage from "./pages/ProgressPage";
import RecipesPage from "./pages/RecipesPage";
import SettingsPage from "./pages/SettingsPage";
import WorkoutSessionPage from "./pages/WorkoutSessionPage";
import TemplateBuilderPage from "./pages/TemplateBuilderPage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import NotFound from "./pages/NotFound";
import PastWorkoutSessionPage from "./pages/PastWorkoutSessionPage"; // Import new page
import StatisticsPage from "./pages/StatisticsPage"; // Import new page

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<WorkoutsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/history/workout/:sessionId" element={<PastWorkoutSessionPage />} /> {/* New route */}
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/statistics" element={<StatisticsPage />} /> {/* New route */}
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/recipes/:id" element={<RecipeDetailPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/workout/:templateId" element={<WorkoutSessionPage />} />
            <Route path="/template/new" element={<TemplateBuilderPage />} />
            <Route path="/template/:id/edit" element={<TemplateBuilderPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;