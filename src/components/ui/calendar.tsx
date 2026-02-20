// src/components/ui/calendar.tsx
import React from "react";
import { DayPicker, DayPickerProps } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface CustomCalendarProps extends Partial<DayPickerProps> {}

export const Calendar: React.FC<CustomCalendarProps> = (props) => {
  return (
    <div className="glass-card p-4">
      <DayPicker
        {...props}
        mode="single"
        showOutsideDays
        modifiersClassNames={{
          today: "bg-primary text-primary-foreground rounded-full",
          selected: "bg-secondary text-secondary-foreground rounded-full",
        }}
      />
    </div>
  );
};
