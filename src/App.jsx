import { useEffect } from "react";
import AppRouter from "./router/AppRouter";
import useAuthStore from "./store/useAuthStore";

function App() {
  const startAuthListener = useAuthStore((s) => s.startAuthListener);

  useEffect(() => {
    startAuthListener();
  }, [startAuthListener]);

  return <AppRouter />;
}

export default App;