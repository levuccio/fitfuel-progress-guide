# AI Rules for FitTrack Application

This document outlines the core technologies used in the FitTrack application and provides guidelines for using specific libraries and tools. Adhering to these rules ensures consistency, maintainability, and optimal performance of the codebase.

## Tech Stack Overview

The FitTrack application is built using a modern web development stack, focusing on performance, developer experience, and a rich user interface.

*   **Frontend Framework**: React for building dynamic and interactive user interfaces.
*   **Language**: TypeScript for type safety, improved code quality, and better tooling.
*   **Build Tool**: Vite for a lightning-fast development server and optimized production builds.
*   **Styling**: Tailwind CSS for a utility-first approach to styling, enabling rapid UI development and responsive designs.
*   **UI Components**: shadcn/ui provides a collection of accessible and customizable UI components built on Radix UI and styled with Tailwind CSS.
*   **Routing**: React Router for declarative navigation and managing application routes.
*   **Data Fetching & Caching**: TanStack Query (React Query) for efficient server state management, data fetching, caching, and synchronization.
*   **Icons**: Lucide React for a comprehensive and customizable set of SVG icons.
*   **Date Handling**: `date-fns` for lightweight and efficient date manipulation and formatting.
*   **Charting**: Recharts for creating responsive and interactive data visualizations.
*   **Form Management**: React Hook Form for performant and flexible form handling, integrated with Zod for schema validation.
*   **Toast Notifications**: Sonner for elegant and customizable toast notifications.

## Library Usage Rules

To maintain consistency and leverage the strengths of each library, please follow these guidelines:

*   **UI Components**:
    *   **Prioritize shadcn/ui**: Always use components from `src/components/ui/` (which are shadcn/ui components) when available and suitable for the design.
    *   **Custom Components**: If a required component is not available in shadcn/ui or needs significant custom logic/styling, create a new component in `src/components/` and style it exclusively with Tailwind CSS. **Do not modify existing shadcn/ui component files.**
*   **Styling**:
    *   **Tailwind CSS Only**: All styling must be done using Tailwind CSS utility classes. Avoid inline styles or custom CSS files (other than `src/index.css` for global styles and variables).
    *   **Responsiveness**: Ensure all designs are responsive and adapt well to different screen sizes using Tailwind's responsive utilities.
*   **Routing**:
    *   **React Router DOM**: Use `react-router-dom` for all client-side navigation.
    *   **Route Definitions**: Define all main application routes within `src/App.tsx`.
    *   **Navigation**: Use `<Link>` components for declarative navigation and `useNavigate` hook for programmatic navigation.
*   **Data Management**:
    *   **Server State**: For fetching, caching, and updating server data (even if simulated with local storage for now), use `TanStack Query`.
    *   **Local State**: For simple component-level state, use React's `useState` and `useReducer`.
    *   **Persistent Local Storage**: For persistent client-side data storage, utilize the `useLocalStorage` hook found in `src/hooks/useLocalStorage.ts`.
*   **Icons**:
    *   **Lucide React**: All icons should be imported and used from the `lucide-react` library.
*   **Date & Time**:
    *   **date-fns**: Use `date-fns` for any operations involving dates, such as formatting, parsing, or calculating differences.
*   **Forms**:
    *   **React Hook Form**: Implement all forms using `react-hook-form` for efficient state management and validation.
    *   **Zod**: Use `zod` for defining and validating form schemas.
*   **Notifications**:
    *   **Sonner**: For displaying temporary, non-intrusive messages to the user (e.g., "Workout saved!"), use `sonner`.
    *   **shadcn/ui Toast**: The `useToast` hook from `src/hooks/use-toast.ts` is also available for more traditional toast notifications if needed, but `sonner` is generally preferred for simple messages.
*   **Charting**:
    *   **Recharts**: Use `recharts` for all data visualization and charting needs.
*   **Utility Functions**:
    *   **`cn` Utility**: For conditionally joining Tailwind CSS classes, always use the `cn` function from `src/lib/utils.ts`.