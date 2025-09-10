import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routers/AppRoutes";
import { Toaster } from "sonner";

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;
