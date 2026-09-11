// Tiện ích dùng làm callback `onInvalid` của react-hook-form: đưa người dùng
// tới trường lỗi đầu tiên khi submit thất bại.

const FOCUSABLE_TAGS = new Set(["INPUT", "SELECT", "TEXTAREA", "BUTTON"]);
const FOCUSABLE_SELECTOR = "input:not([type=hidden]), select, textarea, button, [tabindex]";

// Kiểm tra giá trị có phải một phần tử DOM hay không.
const isElement = (el) => typeof HTMLElement !== "undefined" && el instanceof HTMLElement;

// Kiểm tra phần tử có thể nhận focus hay không.
const isFocusable = (el) =>
  isElement(el) && el.type !== "hidden" && (FOCUSABLE_TAGS.has(el.tagName) || el.tabIndex >= 0);

// Gom các DOM node ứng với từng lỗi trong cây errors của react-hook-form.
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

// Chọn node xuất hiện sớm nhất trong cây DOM.
const earliestInDom = (nodes) =>
  nodes.reduce((earliest, el) => {
    if (!earliest) return el;
    const pos = el.compareDocumentPosition(earliest);
    return pos & Node.DOCUMENT_POSITION_FOLLOWING ? el : earliest;
  }, null);

// Cuộn tới và focus trường nhập bị lỗi đầu tiên sau khi submit form thất bại.
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

  const focusable = isFocusable(target) ? target : target.querySelector?.(FOCUSABLE_SELECTOR);

  (focusable || target).scrollIntoView({ behavior: "smooth", block: "center" });

  // Focus sau khi yêu cầu cuộn; preventScroll để không nhảy giật, phá hiệu ứng smooth.
  if (focusable && typeof focusable.focus === "function") {
    focusable.focus({ preventScroll: true });
  }
}
