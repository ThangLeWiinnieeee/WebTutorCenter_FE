import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AOS from "aos";
import "aos/dist/aos.css";
import { store } from "@/app/store";
import App from "./App.jsx";
import "./index.css";

// Khởi tạo hiệu ứng cuộn (Animate On Scroll) toàn cục
AOS.init({
  duration: 700,
  easing: "ease-out-cubic",
  once: true,
  offset: 80,
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <App />
      </Provider>
    </GoogleOAuthProvider>
  </StrictMode>
);
