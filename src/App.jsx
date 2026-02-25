import AppRouter from "./router/AppRouter";
import { Toaster } from "sonner";

function App() {
  return (
    <>
      <AppRouter />
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;