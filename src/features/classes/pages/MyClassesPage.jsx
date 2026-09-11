import MyClassesPanel from "@/features/classes/components/MyClassesPanel";

// Trang gia sư xem các lớp mình đã nhận.
export default function MyClassesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <MyClassesPanel />
      </div>
    </div>
  );
}
