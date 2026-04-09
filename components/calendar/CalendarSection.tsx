"use client";

import { WEEKDAY_LABELS } from "@/lib/calendar/constants";

type CalendarDay = number | "";

type CalendarSectionProps = {
  monoFontClassName: string;
  now: Date;
  rangeStart: string;
  rangeEnd: string;
  onRangeStartChange: (value: string) => void;
  onRangeEndChange: (value: string) => void;
  calendarCells: CalendarDay[];
  isToday: (day: CalendarDay) => boolean;
  isInRange: (day: CalendarDay) => boolean;
  isRangeStart: (day: CalendarDay) => boolean;
  isRangeEnd: (day: CalendarDay) => boolean;
  getHolidayName: (day: CalendarDay) => string;
  onDateCellClick: (day: CalendarDay) => void;
};

export function CalendarSection({
  monoFontClassName,
  now,
  rangeStart,
  rangeEnd,
  onRangeStartChange,
  onRangeEndChange,
  calendarCells,
  isToday,
  isInRange,
  isRangeStart,
  isRangeEnd,
  getHolidayName,
  onDateCellClick,
}: CalendarSectionProps) {
  return (
    <div className={`${monoFontClassName} w-80 h-full flex flex-col pl-4`}>
      <div className="w-full flex items-center justify-between">
        <p>{now.toLocaleDateString("en-GB", { day: "2-digit", month: "long" })}</p>
        <p className="text-4xl">{now.getFullYear()}</p>
      </div>
      <div className="w-full flex items-center justify-between mt-2 border-b border-zinc-400 pb-2">
        <input
          type="date"
          value={rangeStart}
          onChange={(event) => onRangeStartChange(event.target.value)}
          onMouseDown={(event) => event.stopPropagation()}
          onTouchStart={(event) => event.stopPropagation()}
          className="w-28 text-xs px-1 py-0.5"
        />
        <span>-</span>
        <input
          type="date"
          value={rangeEnd}
          onChange={(event) => onRangeEndChange(event.target.value)}
          onMouseDown={(event) => event.stopPropagation()}
          onTouchStart={(event) => event.stopPropagation()}
          className="w-28 text-xs px-1 py-0.5"
        />
      </div>
      <div className="w-full grid grid-cols-7 auto-rows-fr mt-1">
        {WEEKDAY_LABELS.map((weekday, index) => (
          <p key={`weekday-${index}`} className="text-center text-xs font-semibold py-0.5">
            {weekday}
          </p>
        ))}

        {calendarCells.map((day, index) => {
          const holidayName = getHolidayName(day);

          return (
            <p
              key={`day-${index}`}
              className={`text-center py-0.5 rounded-lg ${isInRange(day) ? "bg-blue-100" : ""} ${isRangeStart(day) ? "bg-sky-500 text-white font-bold" : ""} ${isRangeEnd(day) ? "bg-sky-500 text-white font-bold" : ""} ${isToday(day) && !isRangeStart(day) && !isRangeEnd(day) ? "font-bold bg-amber-200" : ""}`}
              title={holidayName || undefined}
              onMouseDown={(event) => event.stopPropagation()}
              onTouchStart={(event) => event.stopPropagation()}
              onClick={() => onDateCellClick(day)}
            >
              {day || "\u00A0"}
              {holidayName ? <span className="ml-0.5 text-[12px] text-red-700 align-top">*</span> : null}
            </p>
          );
        })}
      </div>
    </div>
  );
}
