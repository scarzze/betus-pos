// src/components/ui/calendar.tsx
import React from "react";
import { DayPicker, DayPickerProps } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarProps extends DayPickerProps {}

export const Calendar: React.FC<CalendarProps> = (props) => {
  return (
    <DayPicker
      {...props}
      components={{
        IconLeft: ChevronLeft as any,
        IconRight: ChevronRight as any,
      }}
      className="rounded-md border p-2"
    />
  );
};
