const MultiCheckbox = ({ options, value = [], onChange, columns = 3 }) => {
  const toggle = (item) => {
    if (value.includes(item)) {
      onChange(value.filter((v) => v !== item));
    } else {
      onChange([...value, item]);
    }
  };

  return (
    <div
      className={`grid gap-2 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {options.map((opt) => {
        const isSelected = value.includes(opt);
        return (
          <label
            key={opt}
            className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition-colors select-none
              ${isSelected
                ? "bg-[#1e3a5f] text-white"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={isSelected}
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
