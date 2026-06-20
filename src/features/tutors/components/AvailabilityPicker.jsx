import WeeklyHourGrid from "@/features/classes/components/WeeklyHourGrid";

const AvailabilityPicker = ({ value = [], onChange }) => {
  return (
    <div className="w-full">
      <WeeklyHourGrid value={value} onChange={onChange} />
    </div>
  );
};

export default AvailabilityPicker;
