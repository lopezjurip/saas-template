import { createRoot } from "react-dom/client";
import App from "./App";

const domNode = document.getElementById("app");
if (!domNode) {
  throw new Error('Could not find element with id "app"');
}
createRoot(domNode).render(<App />);
