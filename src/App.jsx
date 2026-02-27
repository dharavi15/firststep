import { useEffect } from "react";
import AppRouter from "./router/AppRouter";
import { Toaster } from "sonner";
import useAuthStore from "./store/useAuthStore";

function App() {
  const startAuthListener = useAuthStore((s) => s.startAuthListener);

  useEffect(() => {
    startAuthListener();
  }, [startAuthListener]);

  return (
    <>
      <AppRouter />
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;