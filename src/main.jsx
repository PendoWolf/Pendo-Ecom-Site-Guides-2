import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

/* eslint-disable no-undef */
const VISITOR_KEY = "pieriot-visitor-id";
let visitorId = localStorage.getItem(VISITOR_KEY);
if (!visitorId) {
  visitorId = crypto.randomUUID();
  localStorage.setItem(VISITOR_KEY, visitorId);
}

pendo.initialize({
  visitor: {
    id: visitorId,
  },
});
/* eslint-enable no-undef */

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
