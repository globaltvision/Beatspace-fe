import "./App.css";
import { BrowserRouter } from "react-router-dom";
import Router from "./routers/Router";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Toaster
            position="bottom-right"
            closeButton
            toastOptions={{
              unstyled: false,
              style: {
                background: '#131319',
                border: '1px solid rgba(203,200,149,0.35)',
                color: '#F6F4D3',
                fontFamily: "'Alexandria', sans-serif",
                fontSize: '13px',
                fontWeight: '400',
                borderRadius: 0,
                boxShadow: '0 16px 48px rgba(0,0,0,0.75)',
                padding: '14px 18px',
                minWidth: '300px',
                maxWidth: '380px',
              },
            }}
          />
          <Router />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
