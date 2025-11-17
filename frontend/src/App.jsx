import { useEffect } from "react";
import "./App.css";
import useAuthStore from "./stores/authStore";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <>
      <Login />
      <Register />
    </>
  );
}

export default App;
