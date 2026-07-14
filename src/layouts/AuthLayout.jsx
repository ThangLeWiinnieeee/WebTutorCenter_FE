import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import ScrollToTop from "@/components/shared/ScrollToTop";
import PageLoader from "@/components/shared/PageLoader";

const AuthLayout = () => {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </>
  );
};

export default AuthLayout;
