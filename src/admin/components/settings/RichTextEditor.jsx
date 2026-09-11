import { useEffect, useRef } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";

const tools = [
  { label: "In đậm", icon: Bold, command: "bold" },
  { label: "In nghiêng", icon: Italic, command: "italic" },
  { label: "Gạch chân", icon: Underline, command: "underline" },
  { label: "Gạch ngang", icon: Strikethrough, command: "strikeThrough" },
  { label: "Tiêu đề lớn", icon: Heading1, command: "formatBlock", value: "h1" },
  { label: "Tiêu đề", icon: Heading2, command: "formatBlock", value: "h2" },
  { label: "Danh sách dấu chấm", icon: List, command: "insertUnorderedList" },
  { label: "Danh sách đánh số", icon: ListOrdered, command: "insertOrderedList" },
  { label: "Căn trái", icon: AlignLeft, command: "justifyLeft" },
  { label: "Căn giữa", icon: AlignCenter, command: "justifyCenter" },
  { label: "Căn phải", icon: AlignRight, command: "justifyRight" },
  { label: "Hoàn tác", icon: Undo2, command: "undo" },
  { label: "Làm lại", icon: Redo2, command: "redo" },
];

const placeholders = [
  ["{{address}}", "Địa chỉ"],
  ["{{email}}", "Email"],
  ["{{hotlineList}}", "Danh sách hotline"],
  ["{{classCode}}", "Mã lớp"],
];

const RichTextEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor && document.activeElement !== editor && editor.innerHTML !== value) {
      editor.innerHTML = value;
    }
  }, [value]);

  const runCommand = (command, commandValue) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current?.innerHTML || "");
  };

  const handlePaste = (event) => {
    event.preventDefault();
    document.execCommand("insertText", false, event.clipboardData.getData("text/plain"));
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2">
        {tools.map(({ label, icon: Icon, command, value: commandValue }) => (
          <button
            key={label}
            type="button"
            title={label}
            aria-label={label}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand(command, commandValue)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 transition hover:bg-white hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
        <div className="mx-1 h-6 w-px bg-slate-200" />
        <select
          defaultValue=""
          aria-label="Chèn dữ liệu tự động"
          onChange={(event) => {
            if (event.target.value) runCommand("insertText", event.target.value);
            event.target.value = "";
          }}
          className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="" disabled>
            Chèn dữ liệu tự động
          </option>
          {placeholders.map(([token, label]) => (
            <option key={token} value={token}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div
        ref={editorRef}
        role="textbox"
        aria-label="Nội dung hợp đồng mẫu"
        aria-multiline="true"
        contentEditable
        suppressContentEditableWarning
        spellCheck
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        onPaste={handlePaste}
        className="min-h-[32rem] bg-white px-7 py-6 text-[15px] leading-7 text-slate-800 outline-none [font-family:'Times_New_Roman',Times,serif] [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_h1]:my-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:my-4 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:my-3 [&_h3]:text-lg [&_h3]:font-bold [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-6"
      />
    </div>
  );
};

export default RichTextEditor;
