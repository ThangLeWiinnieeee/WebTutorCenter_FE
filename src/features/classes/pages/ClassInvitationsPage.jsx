import { Handshake } from "lucide-react";
import ClassInvitationsPanel from "@/features/classes/components/ClassInvitationsPanel";

export default function ClassInvitationsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-linear-to-r from-[#1e3a5f] to-[#2c5282]">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="flex items-center gap-2 text-emerald-300">
            <Handshake className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">Lời mời dạy lớp</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold text-white">Lời mời dạy lớp của bạn</h1>
          <p className="mt-1 text-sm text-slate-200">
            Người dùng đã chọn đích danh bạn cho lớp của họ. Xem chi tiết và quyết định nhận hoặc từ chối.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <ClassInvitationsPanel />
      </div>
    </div>
  );
}
