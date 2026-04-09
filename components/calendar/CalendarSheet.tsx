"use client";

import Image from "next/image";
import { CalendarSection } from "@/components/calendar/CalendarSection";
import { NotesSection } from "@/components/calendar/NotesSection";
import { SpiralBinding } from "@/components/calendar/SpiralBinding";
import { useWallCalendar } from "@/hooks/useWallCalendar";

type CalendarSheetProps = {
  monthDate: Date;
  monoFontClassName: string;
  handwrittenFontClassName: string;
  storageKeyPrefix: string;
  topImageSrc: string;
  cardBgColor: string;
};

export function CalendarSheet({ monthDate, monoFontClassName, handwrittenFontClassName, storageKeyPrefix, topImageSrc, cardBgColor }: CalendarSheetProps) {
  const {
    now,
    notes,
    setNotes,
    rangeStart,
    setRangeStart,
    rangeEnd,
    setRangeEnd,
    calendarCells,
    isToday,
    isInRange,
    isRangeStart,
    isRangeEnd,
    getHolidayName,
    handleDateCellClick,
  } = useWallCalendar(monthDate, storageKeyPrefix);

  return (
    <div className="w-140 h-160" style={{ backgroundColor: cardBgColor }}>
      <div className="w-full h-80 select-none relative">
        <div className="absolute -top-3 left-0 w-full flex items-start justify-center pointer-events-none z-10">
          <SpiralBinding />
        </div>
        <Image src={topImageSrc} alt="Calendar" className="opacity-80 select-none pointer-events-none" fill />
      </div>
      <div className="w-full flex items-center justify-between p-4">
        <NotesSection
          notes={notes}
          onNotesChange={setNotes}
          monoFontClassName={monoFontClassName}
          handwrittenFontClassName={handwrittenFontClassName}
        />

        <CalendarSection
          monoFontClassName={monoFontClassName}
          now={now}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          onRangeStartChange={setRangeStart}
          onRangeEndChange={setRangeEnd}
          calendarCells={calendarCells}
          isToday={isToday}
          isInRange={isInRange}
          isRangeStart={isRangeStart}
          isRangeEnd={isRangeEnd}
          getHolidayName={getHolidayName}
          onDateCellClick={handleDateCellClick}
        />
      </div>
    </div>
  );
}
