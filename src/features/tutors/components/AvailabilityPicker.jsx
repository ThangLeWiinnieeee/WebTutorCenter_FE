import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DAYS_OF_WEEK_OPTIONS } from "@/features/tutors/constants";

const AvailabilityPicker = ({ value = [], onChange }) => {
  const addSlot = () => {
    onChange([...value, { day: "Mon", startTime: "08:00", endTime: "10:00" }]);
  };

  const removeSlot = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateSlot = (index, field, newVal) => {
    const updated = value.map((slot, i) =>
      i === index ? { ...slot, [field]: newVal } : slot
    );
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      {value.map((slot, index) => (
        <div key={index} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
          <Select
            value={slot.day}
            onValueChange={(v) => updateSlot(index, "day", v)}
          >
            <SelectTrigger className="w-28 h-8 text-xs cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DAYS_OF_WEEK_OPTIONS.map((d) => (
                <SelectItem key={d.value} value={d.value} className="text-xs cursor-pointer">
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="time"
            value={slot.startTime}
            onChange={(e) => updateSlot(index, "startTime", e.target.value)}
            className="w-28 h-8 text-xs"
          />
          <span className="text-xs text-slate-500">—</span>
          <Input
            type="time"
            value={slot.endTime}
            onChange={(e) => updateSlot(index, "endTime", e.target.value)}
            className="w-28 h-8 text-xs"
          />

          <button
            type="button"
            onClick={() => removeSlot(index)}
            className="ml-auto text-slate-400 hover:text-rose-500 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addSlot}
        className="gap-1.5 text-xs"
      >
        <Plus className="h-3.5 w-3.5" />
        Thêm khung giờ
      </Button>
    </div>
  );
};

export default AvailabilityPicker;
