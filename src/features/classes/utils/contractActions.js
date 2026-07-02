import { toast } from "sonner";

// CSS tự chứa cho cửa sổ in — không phụ thuộc Tailwind (cửa sổ in không nạp CSS của app).
// Style theo thẻ ngữ nghĩa (h1/h2/h3/p/ol/li) + vài class hook mà ContractTemplate gắn sẵn.
const PRINT_CSS = `
  * { box-sizing: border-box; }
  body { font-family: 'Times New Roman', Times, serif; color:#111; line-height:1.55;
         max-width: 760px; margin:0 auto; padding:28px 24px; font-size:13px; }
  h1 { text-align:center; font-size:20px; margin:0 0 4px; text-transform:uppercase; }
  h2 { font-size:15px; margin:20px 0 8px; }
  h3 { font-size:13px; margin:14px 0 6px; }
  p { margin:8px 0; text-align:justify; }
  ol, ul { margin:8px 0; padding-left:24px; }
  li { margin:5px 0; text-align:justify; }
  strong { font-weight:bold; }
  .contract-note { text-align:center; font-style:italic; color:#b91c1c; margin:2px 0 16px; }
  .contract-party { margin:6px 0 14px; }
  .contract-row { margin:5px 0; }
  .contract-blank { display:inline-block; min-width:120px; border-bottom:1px dotted #555; }
  .contract-clause { margin:10px 0; }
  .contract-signatures { display:flex; justify-content:space-between; gap:24px;
                         margin-top:36px; text-align:center; }
  .contract-signatures > div { flex:1; }
  .contract-sign-role { font-weight:bold; }
  .contract-sign-hint { font-style:italic; color:#555; font-size:12px; }
  @page { margin:16mm; }
`;

// In hợp đồng: mở cửa sổ mới với đúng nội dung đang hiển thị (innerHTML của node) + CSS in riêng.
// Cách này in được sạch sẽ ở cả dev lẫn production mà không đụng tới CSS toàn cục của app.
export function printContract(node) {
  if (!node) return;
  const win = window.open("", "_blank", "width=880,height=1000");
  if (!win) {
    toast.error("Trình duyệt đã chặn cửa sổ in. Vui lòng cho phép popup rồi thử lại.");
    return;
  }
  win.document.write(
    `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8">` +
      `<title>Hợp đồng giao (nhận) lớp</title><style>${PRINT_CSS}</style></head>` +
      `<body>${node.innerHTML}</body></html>`,
  );
  win.document.close();
  win.focus();
  // Đợi nội dung render xong rồi gọi hộp thoại in.
  setTimeout(() => {
    try {
      win.print();
    } catch {
      /* người dùng có thể tự bấm Ctrl+P */
    }
  }, 350);
}

// Sao chép toàn bộ nội dung hợp đồng dưới dạng văn bản thuần (lấy innerText của node đang hiển thị).
export async function copyContract(node) {
  if (!node) return;
  const text = node.innerText?.trim();
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Đã sao chép nội dung hợp đồng vào bộ nhớ tạm");
  } catch {
    toast.error("Không thể sao chép, vui lòng thử lại hoặc bôi đen để copy thủ công");
  }
}
