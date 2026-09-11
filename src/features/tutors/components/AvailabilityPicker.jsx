import WeeklyHourGrid from "@/features/classes/components/WeeklyHourGrid";

// Bộ chọn lịch rảnh của gia sư, dùng lại lưới giờ theo tuần.
const AvailabilityPicker = ({ value = [], onChange }) => {
  return (
    <div className="w-full">
      <WeeklyHourGrid value={value} onChange={onChange} />
    </div>
  );
};

export default AvailabilityPicker;
