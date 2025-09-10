// main.tsx
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "@/utils/globalErrorHandler";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />
);
