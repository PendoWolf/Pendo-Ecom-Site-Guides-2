import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

/* eslint-disable no-undef */
pendo.initialize({
  visitor: {
    id: "",
  },
});
/* eslint-enable no-undef */

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
