/**
 * Cuộn tới và focus trường nhập ĐẦU TIÊN bị lỗi khi submit form thất bại.
 *
 * Dùng làm callback `onInvalid` của react-hook-form:
 *   <form onSubmit={handleSubmit(onValid, scrollToFirstError)}>
 *
 * Hỗ trợ mọi kiểu trường:
 * - Input thường (register): lấy theo DOM ref mà react-hook-form gắn ở mỗi lỗi.
 * - Component shadcn bọc trong <FormControl> (Select, picker tùy biến...): nhận diện qua
 *   thuộc tính `aria-invalid="true"` mà FormControl tự gắn khi field có lỗi.
 * - Chọn trường xuất hiện sớm nhất trong DOM (không phụ thuộc thứ tự key của errors),
 *   và giới hạn trong đúng form vừa submit khi có thể (tránh bắt nhầm form khác trên trang).
 */

const FOCUSABLE_TAGS = new Set(["INPUT", "SELECT", "TEXTAREA", "BUTTON"]);
const FOCUSABLE_SELECTOR =
  "input:not([type=hidden]), select, textarea, button, [tabindex]";

const isElement = (el) =>
  typeof HTMLElement !== "undefined" && el instanceof HTMLElement;

const isFocusable = (el) =>
  isElement(el) &&
  el.type !== "hidden" &&
  (FOCUSABLE_TAGS.has(el.tagName) || el.tabIndex >= 0);

// Đệ quy gom các DOM node mà react-hook-form gắn vào từng lỗi (kể cả lỗi lồng nhau).
const collectErrorRefNodes = (node, nodes) => {
  if (!node || typeof node !== "object") return;

  const ref = node.ref;
  if (ref) {
    const el = Array.isArray(ref) ? ref.find(isElement) : ref;
    if (isElement(el)) {
      nodes.push(el);
      return;
    }
  }

  for (const key of Object.keys(node)) {
    if (key === "message" || key === "type" || key === "types" || key === "ref") continue;
    collectErrorRefNodes(node[key], nodes);
  }
};

// So sánh để chọn node nằm sớm hơn trong cây DOM.
const earliestInDom = (nodes) =>
  nodes.reduce((earliest, el) => {
    if (!earliest) return el;
    const pos = el.compareDocumentPosition(earliest);
    return pos & Node.DOCUMENT_POSITION_FOLLOWING ? el : earliest;
  }, null);

export function scrollToFirstError(errors) {
  if (!errors || typeof errors !== "object") return;
  if (typeof document === "undefined") return;

  const refNodes = [];
  collectErrorRefNodes(errors, refNodes);

  // Giới hạn phạm vi tìm kiếm trong đúng form vừa submit (nếu xác định được).
  const scope = refNodes[0]?.closest?.("form") || document;
  const ariaNodes = Array.from(scope.querySelectorAll('[aria-invalid="true"]'));

  // Gộp 2 nguồn ứng viên, loại trùng.
  const candidates = Array.from(new Set([...refNodes, ...ariaNodes])).filter(isElement);
  if (candidates.length === 0) return;

  const target = earliestInDom(candidates);
  if (!target) return;

  const focusable = isFocusable(target)
    ? target
    : target.querySelector?.(FOCUSABLE_SELECTOR);

  (focusable || target).scrollIntoView({ behavior: "smooth", block: "center" });

  // Focus sau khi yêu cầu cuộn; preventScroll để không nhảy giật, phá hiệu ứng smooth.
  if (focusable && typeof focusable.focus === "function") {
    focusable.focus({ preventScroll: true });
  }
}
