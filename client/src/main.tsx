import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Remove loading screen when app starts
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('app-ready');
});

createRoot(document.getElementById("root")!).render(<App />);
