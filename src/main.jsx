import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./i18n";
import "./index.css";
import App from "./App.jsx";
import { theme } from "./configs/theme.config.js";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import { Provider } from "react-redux";
import "mantine-react-table/styles.css";
import QueryProvider from "./configs/query.config.jsx";
import store from "./store/store.js";
import { SettingsProvider } from "./contexts/SettingsContext.jsx";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <div className="app-root">
      <div className="rotate-overlay">
        <div className="rotate-container">
          <p className="rotate-message">
            Please rotate your device and hide the toolbar from browser settings for the best experience
          </p>
          <img src="/assets/200w.gif" alt="rotate"/>
        </div>
      </div>
      <div className="app-content">  
      <MantineProvider theme={theme}>
        <Notifications position="bottom-right" />
        <QueryProvider>
          <SettingsProvider>
            <App />
          </SettingsProvider>
        </QueryProvider>
      </MantineProvider>
    </div>
    </div>
  </Provider>
);
