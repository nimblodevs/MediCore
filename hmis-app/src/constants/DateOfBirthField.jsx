import { useState } from "react";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { DayPicker } from "react-day-picker";

import "react-day-picker/dist/style.css";

const DateOfBirthField = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <label className="mb-1.5 block text-sm font-semibold text-slate-800">
        Date of birth
      </label>

      {/* INPUT */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 w-full items-center rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-xs"
      >
        <CalendarDays className="mr-2 size-4 text-slate-500" />

        {value ? format(value, "dd MMM yyyy") : "Select date of birth"}
      </button>

      {/* CALENDAR */}
      {open && (
        <div className="absolute z-50 mt-2 rounded-xl border bg-white p-3 shadow-xl">
          <DayPicker
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date);
              setOpen(false);
            }}
            captionLayout="dropdown"
            fromYear={1900}
            toYear={new Date().getFullYear()}
          />
        </div>
      )}
    </div>
  );
};

export default DateOfBirthField;
