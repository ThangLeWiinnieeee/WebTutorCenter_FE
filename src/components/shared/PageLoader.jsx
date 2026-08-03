// Spinner hiển thị trong lúc chunk của trang đang tải (fallback cho Suspense).
const PageLoader = () => (
  <div className="flex min-h-[40vh] w-full items-center justify-center">
    <div
      className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-brand"
      role="status"
      aria-label="Đang tải"
    />
  </div>
);

export default PageLoader;
