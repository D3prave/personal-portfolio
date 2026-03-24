import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CloudflareWebAnalytics } from "./components/CloudflareWebAnalytics";
import { SmoothScrollProvider } from "./components/SmoothScrollProvider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CloudflareWebAnalytics />
    <SmoothScrollProvider>
      <App />
    </SmoothScrollProvider>
  </React.StrictMode>,
);
