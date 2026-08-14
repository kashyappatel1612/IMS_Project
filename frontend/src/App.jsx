import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: "var(--radius-md, 10px)",
            background: "var(--card-bg, #ffffff)",
            color: "var(--text-main, #334155)",
            border: "1px solid var(--border-color, #e2e8f0)",
            boxShadow: "var(--shadow-md, 0 4px 12px -2px rgba(15, 23, 42, 0.06))",
            fontFamily: "var(--font-sans, sans-serif)",
            fontSize: "13.5px",
            padding: "12px 16px",
          },
          success: {
            iconTheme: {
              primary: "var(--success, #22c55e)",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "var(--danger, #ef4444)",
              secondary: "#ffffff",
            },
          },
        }}
      />
    </ThemeProvider>
  );
}

export default App;