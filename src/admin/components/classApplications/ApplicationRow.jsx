import { BookOpen, CheckCircle2, Eye, Loader2, MessageCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TutorAvatar, SubjectMatchBadge, StatusBadge } from "./badges";
import { formatDate } from "./formatters";

const ApplicationRow = ({ application, activeTab, actionLoading, onApprove, onReject, onViewClass, onViewTutor, onChat }) => {
  const { classItem, tutor, status, rejectionReason } = application;
  const isLoading = actionLoading === application.id;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm">
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
      {/* Mã lớp + môn */}
      <div className="flex items-center gap-3">
        <span className="rounded-lg bg-[#1e3a5f] px-2.5 py-1.5 text-xs font-bold text-white shadow-sm">
          #{classItem?.classCode || "—"}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800">{classItem?.subject || "—"}</p>
          <p className="text-xs text-slate-400">Ứng tuyển {formatDate(application.createdAt)}</p>
        </div>
      </div>

      <div className="hidden h-8 w-px bg-slate-100 xl:block" />

      {/* Gia sư */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <TutorAvatar tutor={tutor} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">{tutor?.fullName || "—"}</p>
          <div className="mt-0.5">
            <SubjectMatchBadge tutorSubjects={tutor?.subjects} classSubject={classItem?.subject} />
          </div>
        </div>
      </div>

      {/* Nút xem chi tiết */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onViewClass(application)}
          className="rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          <BookOpen className="h-4 w-4" />
          Xem bài đăng
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onViewTutor(application)}
          className="rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          <Eye className="h-4 w-4" />
          Xem gia sư
        </Button>
        {/* Chỉ hiện với gia sư đang chờ duyệt — mở/tiếp tục hội thoại chat để trao đổi */}
        {activeTab === "selected" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChat(application)}
            className="rounded-lg border-[#1e3a5f]/30 text-[#1e3a5f] hover:bg-[#1e3a5f]/5"
          >
            <MessageCircle className="h-4 w-4" />
            Trò chuyện
          </Button>
        )}
      </div>

      {/* Hành động / trạng thái */}
      {activeTab === "selected" ? (
        <div className="flex items-center gap-2 border-t border-slate-100 pt-3 xl:border-l xl:border-t-0 xl:pl-3 xl:pt-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => onReject(application.id)}
            className="rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            Từ chối
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isLoading}
            onClick={() => onApprove(application.id)}
            className="rounded-lg bg-emerald-600 px-4 font-semibold text-white hover:bg-emerald-700"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Duyệt
          </Button>
        </div>
      ) : (
        <div className="border-t border-slate-100 pt-3 xl:border-t-0 xl:pt-0">
          <StatusBadge status={status} />
        </div>
      )}
    </div>

    {status === "rejected" && rejectionReason && (
      <div className="mt-3 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2">
        <p className="text-xs font-bold uppercase tracking-wide text-rose-700">Lý do từ chối</p>
        <p className="mt-0.5 text-xs leading-relaxed text-rose-600">{rejectionReason}</p>
      </div>
    )}
    </div>
  );
};

export default ApplicationRow;
