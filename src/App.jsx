import { useEffect, useRef } from "react";
import AppRouter from "./router/AppRouter";
import useAuthStore from "./store/useAuthStore";

function App() {
  const startAuthListener = useAuthStore((s) => s.startAuthListener);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    startAuthListener();
  }, [startAuthListener]);

  return <AppRouter />;
}

export default App;