import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routers/AppRoutes";
import { Toaster } from "sonner";
import { QueryProvider } from "./providers/QueryProvider";

function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" />
      </BrowserRouter>
    </QueryProvider>
  );
}

export default App;
