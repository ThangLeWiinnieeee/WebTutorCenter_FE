import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import router from "@/routes";
import AuthBootstrap from "@/features/auth/components/AuthBootstrap";
import { ChatSocketProvider } from "@/features/chat";

const App = () => {
  return (
    <AuthBootstrap>
      <ChatSocketProvider>
        <RouterProvider router={router} />
      </ChatSocketProvider>
      <Toaster position="top-right" richColors />
    </AuthBootstrap>
  );
};

export default App;
