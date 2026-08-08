import useSiteSettings from "@/hooks/useSiteSettings";

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const resolveContractPlaceholders = (html, settings, classCode) => {
  const phones = [...new Set([settings.phone, settings.phone2].filter(Boolean))];
  const values = {
    address: settings.address,
    email: settings.email,
    hotline1: settings.phone,
    hotline2: settings.phone2,
    hotlineList: phones.join(" hoặc "),
    classCode: classCode ? `#${classCode}` : "................................",
  };

  return html.replace(/\{\{(address|email|hotline1|hotline2|hotlineList|classCode)\}\}/g, (_, key) =>
    escapeHtml(values[key] || ""),
  );
};

// Hợp đồng mẫu được admin soạn và lưu trong database; classCode được điền khi mở từ chi tiết lớp.
const ContractTemplate = ({ classCode, innerRef }) => {
  const { data, loading, error } = useSiteSettings();

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-3" aria-label="Đang tải hợp đồng">
        <div className="mx-auto h-7 w-2/3 animate-pulse rounded bg-slate-200" />
        {[...Array(9)].map((_, index) => (
          <div key={index} className="h-4 animate-pulse rounded bg-slate-100" />
        ))}
      </div>
    );
  }

  if (error || !data.contractHtml) {
    return (
      <div className="mx-auto max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
        Chưa tải được nội dung hợp đồng mẫu. Vui lòng thử lại sau.
      </div>
    );
  }

  return (
    <div
      ref={innerRef}
      className="contract-document mx-auto max-w-3xl bg-white text-[13.5px] leading-relaxed text-slate-800 [font-family:'Times_New_Roman',Times,serif] [&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_h1]:mb-4 [&_h1]:text-center [&_h1]:text-xl [&_h1]:font-bold [&_h1]:uppercase [&_h1]:text-slate-900 [&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-slate-900 [&_h3]:my-2 [&_h3]:font-bold [&_h3]:text-slate-900 [&_li]:my-1.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2.5 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6"
      dangerouslySetInnerHTML={{
        __html: resolveContractPlaceholders(data.contractHtml, data, classCode),
      }}
    />
  );
};

export default ContractTemplate;
