import { jsx as _jsx } from "react/jsx-runtime";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
export const Calendar = (props) => {
    return (_jsx("div", { className: "p-4 rounded-lg border bg-white shadow-sm", children: _jsx(DayPicker, { ...props, mode: "single", showOutsideDays: true, modifiersClassNames: {
                today: "bg-primary text-primary-foreground rounded-full",
                selected: "bg-secondary text-secondary-foreground rounded-full",
            } }) }));
};
