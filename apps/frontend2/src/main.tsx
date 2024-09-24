import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./i18n/config";
import { App } from "./components/App";

const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);

  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
