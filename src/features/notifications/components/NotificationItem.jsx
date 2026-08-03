import { ArrowRight } from "lucide-react";

// Tách phần "Lý do: ..." ra khỏi nội dung chính để hiển thị xuống dòng riêng.
const REASON_LABEL = "Lý do:";
// Tách phần lý do ra khỏi nội dung thông báo để hiển thị riêng.
const splitReason = (message = "") => {
  const idx = message.indexOf(REASON_LABEL);
  if (idx === -1) return { main: message, reason: null };
  return {
    main: message.slice(0, idx).trim(),
    reason: message.slice(idx + REASON_LABEL.length).trim(),
  };
};

// Thẻ hiển thị một thông báo, dùng chung cho cả phía người dùng và admin.
// Icon, liên kết và hành vi khi bấm do nơi gọi truyền vào.
const NotificationItem = ({ notification, iconMeta, link, onClick }) => {
  const Icon = iconMeta.icon;
  const { main, reason } = splitReason(notification.message);
  const isRead = notification.read;

  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer gap-3 rounded-2xl border bg-white p-4 shadow-sm transition-colors hover:bg-slate-50 ${
        !isRead ? "border-blue-200 bg-blue-50/40" : "border-slate-200"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconMeta.className}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className={`text-sm leading-snug ${!isRead ? "font-medium text-slate-800" : "text-slate-600"}`}>
            {main}
          </p>
          <div className="flex shrink-0 items-center gap-2 pt-0.5">
            <span className="whitespace-nowrap text-xs text-slate-400">
              {new Date(notification.createdAt).toLocaleString("vi-VN")}
            </span>
            {!isRead && <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />}
          </div>
        </div>
        {reason && (
          <p className="mt-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
            <span className="font-medium text-slate-500">Lý do:</span> {reason}
          </p>
        )}
        {link && (
          <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-brand">
            {link.label}
            <ArrowRight className="h-3.5 w-3.5" />
          </p>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
