// `lockedValues`: các option luôn được chọn và không thể bỏ (chỉ cho phép bổ sung thêm).
const MultiCheckbox = ({ options, value = [], onChange, columns = 3, lockedValues = [] }) => {
  // Thêm/bớt một mục trong danh sách đã chọn.
  const toggle = (item) => {
    if (lockedValues.includes(item)) return; // môn đã khóa: không cho bỏ
    if (value.includes(item)) {
      onChange(value.filter((v) => v !== item));
    } else {
      onChange([...value, item]);
    }
  };

  // Trên điện thoại luôn 2 cột để chữ không bị bóp; từ sm+ dùng số cột yêu cầu.
  const smColsClass = columns === 2 ? "sm:grid-cols-2" : columns === 4 ? "sm:grid-cols-4" : "sm:grid-cols-3";

  return (
    <div
      className={`grid max-h-48 grid-cols-2 gap-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3 ${smColsClass}`}
    >
      {options.map((opt) => {
        const isSelected = value.includes(opt);
        const isLocked = lockedValues.includes(opt);
        return (
          <label
            key={opt}
            title={isLocked ? "Môn đã đăng ký — không thể bỏ" : undefined}
            className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition-colors select-none
              ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}
              ${
                isSelected
                  ? "bg-brand text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }
              ${isLocked ? "opacity-90" : ""}`}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={isSelected}
              disabled={isLocked}
              onChange={() => toggle(opt)}
            />
            <span className="truncate">{opt}</span>
          </label>
        );
      })}
    </div>
  );
};

export default MultiCheckbox;
