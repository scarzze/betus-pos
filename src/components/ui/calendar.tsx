// src/components/ui/calendar.tsx
import React from "react";
import { DayPicker, DayPickerProps } from "react-day-picker";
import "react-day-picker/dist/style.css";

// Use a proper interface extending only object types
export interface CalendarProps extends Partial<DayPickerProps> {}

export const Calendar: React.FC<CalendarProps> = (props) => {
  return (
    <div className="p-4 rounded-lg border bg-white shadow-sm">
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
