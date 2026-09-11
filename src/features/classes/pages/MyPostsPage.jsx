import MyPostsPanel from "@/features/classes/components/MyPostsPanel";

// Trang người dùng xem các bài đăng tìm gia sư của mình.
export default function MyPostsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <MyPostsPanel />
      </div>
    </div>
  );
}
