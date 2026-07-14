// Fallback trong lúc chunk của trang (React.lazy) đang tải — giữ layout ổn định,
// tránh nhảy khung. Dùng chung cho mọi Suspense boundary ở các layout.
const PageLoader = () => (
  <div className="flex min-h-[40vh] w-full items-center justify-center">
    <div
      className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-[#1e3a5f]"
      role="status"
      aria-label="Đang tải"
    />
  </div>
);

export default PageLoader;
