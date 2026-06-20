import { Outlet } from "react-router-dom";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="flex-1 w-full mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
