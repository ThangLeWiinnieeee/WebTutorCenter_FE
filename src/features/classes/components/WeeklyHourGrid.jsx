const DAYS = [
  { key: "Mon", label: "T2" },
  { key: "Tue", label: "T3" },
  { key: "Wed", label: "T4" },
  { key: "Thu", label: "T5" },
  { key: "Fri", label: "T6" },
  { key: "Sat", label: "T7" },
  { key: "Sun", label: "CN" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const WeeklyHourGrid = ({ value = [], onChange }) => {
  const selected = new Set(value.map((slot) => `${slot.day}-${slot.hour}`));

  const toggleSlot = (day, hour) => {
    const key = `${day}-${hour}`;
    const next = selected.has(key)
      ? value.filter((slot) => !(slot.day === day && slot.hour === hour))
      : [...value, { day, hour }];
    onChange(next);
  };

  return (
    <div className="overflow-auto rounded-md border border-slate-200">
      <table className="w-full min-w-[980px] border-collapse text-xs">
        <thead>
          <tr className="bg-slate-50">
            <th className="border border-slate-200 px-2 py-2 text-left">Giờ</th>
            {DAYS.map((day) => (
              <th key={day.key} className="border border-slate-200 px-2 py-2 text-center">
                {day.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HOURS.map((hour) => (
            <tr key={hour}>
              <td className="border border-slate-200 px-2 py-1.5 font-medium text-slate-600">
                {String(hour).padStart(2, "0")}:00
              </td>
              {DAYS.map((day) => {
                const active = selected.has(`${day.key}-${hour}`);
                return (
                  <td key={`${day.key}-${hour}`} className="border border-slate-200 p-0.5">
                    <button
                      type="button"
                      onClick={() => toggleSlot(day.key, hour)}
                      className={`h-7 w-full rounded-sm transition-colors ${
                        active ? "bg-[#1e3a5f]" : "bg-white hover:bg-slate-100"
                      }`}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WeeklyHourGrid;
