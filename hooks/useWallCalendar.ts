"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HOLIDAY_MARKERS } from "@/lib/calendar/constants";

type CalendarDay = number | "";

function parseLocalDate(dateValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function useWallCalendar(monthDate: Date, storageKeyPrefix: string) {
  const notesStorageKey = `${storageKeyPrefix}-notes`;
  const rangeStartStorageKey = `${storageKeyPrefix}-range-start`;
  const rangeEndStorageKey = `${storageKeyPrefix}-range-end`;
  const combinedStorageKey = `${notesStorageKey}|${rangeStartStorageKey}|${rangeEndStorageKey}`;

  const readStorageValue = (key: string) => {
    if (typeof window === "undefined") {
      return "";
    }

    return window.localStorage.getItem(key) ?? "";
  };

  const [now, setNow] = useState(monthDate);
  const [notes, setNotes] = useState(() => readStorageValue(notesStorageKey));
  const [rangeStart, setRangeStart] = useState(() => readStorageValue(rangeStartStorageKey));
  const [rangeEnd, setRangeEnd] = useState(() => readStorageValue(rangeEndStorageKey));
  const hydratedStorageKeyRef = useRef(combinedStorageKey);
  const pendingHydrationKeyRef = useRef("");

  useEffect(() => {
    setNow(monthDate);
  }, [monthDate]);

  const updateNotes = (value: string) => {
    setNotes(value);
    window.localStorage.setItem(notesStorageKey, value);
  };

  const updateRangeStart = (value: string) => {
    setRangeStart(value);
    window.localStorage.setItem(rangeStartStorageKey, value);
  };

  const updateRangeEnd = (value: string) => {
    setRangeEnd(value);
    window.localStorage.setItem(rangeEndStorageKey, value);
  };

  useEffect(() => {
    // Block persistence while we hydrate the new month key.
    hydratedStorageKeyRef.current = "";
    pendingHydrationKeyRef.current = combinedStorageKey;

    const savedNotes = window.localStorage.getItem(notesStorageKey);
    setNotes(savedNotes ?? "");

    const savedRangeStart = window.localStorage.getItem(rangeStartStorageKey);
    const savedRangeEnd = window.localStorage.getItem(rangeEndStorageKey);
    setRangeStart(savedRangeStart ?? "");
    setRangeEnd(savedRangeEnd ?? "");
  }, [notesStorageKey, rangeEndStorageKey, rangeStartStorageKey]);

  useEffect(() => {
    // Mark hydrated only after state has been updated for the pending key.
    if (pendingHydrationKeyRef.current === combinedStorageKey) {
      hydratedStorageKeyRef.current = combinedStorageKey;
      pendingHydrationKeyRef.current = "";
    }
  }, [combinedStorageKey, notes, rangeStart, rangeEnd]);

  useEffect(() => {
    if (hydratedStorageKeyRef.current !== combinedStorageKey) {
      return;
    }

    window.localStorage.setItem(notesStorageKey, notes);
  }, [combinedStorageKey, notes, notesStorageKey]);

  useEffect(() => {
    if (hydratedStorageKeyRef.current !== combinedStorageKey) {
      return;
    }

    window.localStorage.setItem(rangeStartStorageKey, rangeStart);
    window.localStorage.setItem(rangeEndStorageKey, rangeEnd);
  }, [combinedStorageKey, rangeStart, rangeEnd, rangeEndStorageKey, rangeStartStorageKey]);

  const rangeStartDate = useMemo(() => {
    if (!rangeStart) {
      return null;
    }

    return parseLocalDate(rangeStart);
  }, [rangeStart]);

  const rangeEndDate = useMemo(() => {
    if (!rangeEnd) {
      return null;
    }

    return parseLocalDate(rangeEnd);
  }, [rangeEnd]);

  const normalizedRange = useMemo(() => {
    if (!rangeStartDate || !rangeEndDate) {
      return null;
    }

    if (Number.isNaN(rangeStartDate.getTime()) || Number.isNaN(rangeEndDate.getTime())) {
      return null;
    }

    if (rangeStartDate <= rangeEndDate) {
      return { start: rangeStartDate, end: rangeEndDate };
    }

    return { start: rangeEndDate, end: rangeStartDate };
  }, [rangeEndDate, rangeStartDate]);

  const calendarCells = useMemo(() => {
    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

    return Array.from({ length: totalCells }, (_, index) => {
      const dayNumber = index - firstDay + 1;

      if (dayNumber < 1 || dayNumber > daysInMonth) {
        return "" as const;
      }

      return dayNumber;
    });
  }, [now]);

  const getDayDate = (day: CalendarDay) => {
    if (day === "") {
      return null;
    }

    return new Date(now.getFullYear(), now.getMonth(), Number(day));
  };

  const isToday = (day: CalendarDay) => {
    if (day === "") {
      return false;
    }

    const realNow = new Date();
    return day === realNow.getDate() && now.getMonth() === realNow.getMonth() && now.getFullYear() === realNow.getFullYear();
  };

  const isInRange = (day: CalendarDay) => {
    const dayDate = getDayDate(day);

    if (!dayDate || !normalizedRange) {
      return false;
    }

    return dayDate >= normalizedRange.start && dayDate <= normalizedRange.end;
  };

  const isRangeStart = (day: CalendarDay) => {
    const dayDate = getDayDate(day);

    if (!dayDate || !rangeStartDate) {
      return false;
    }

    return isSameDay(dayDate, rangeStartDate);
  };

  const isRangeEnd = (day: CalendarDay) => {
    const dayDate = getDayDate(day);

    if (!dayDate || !rangeEndDate) {
      return false;
    }

    return isSameDay(dayDate, rangeEndDate);
  };

  const getHolidayName = (day: CalendarDay) => {
    if (day === "") {
      return "";
    }

    const holidayKey = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return HOLIDAY_MARKERS[holidayKey] || (Number(day) === 11 ? "Special Holiday - 11th" : Number(day) === 15 ? "Special Holiday - 15th" : "");
  };

  const handleDateCellClick = (day: CalendarDay) => {
    if (day === "") {
      return;
    }

    const clickedDate = new Date(now.getFullYear(), now.getMonth(), Number(day));
    const clickedDateValue = toDateInputValue(clickedDate);

    if (!rangeStart || (rangeStart && rangeEnd)) {
      updateRangeStart(clickedDateValue);
      updateRangeEnd("");
      return;
    }

    if (!rangeStartDate) {
      updateRangeStart(clickedDateValue);
      return;
    }

    if (clickedDate < rangeStartDate) {
      updateRangeEnd(rangeStart);
      updateRangeStart(clickedDateValue);
      return;
    }

    updateRangeEnd(clickedDateValue);
  };

  return {
    now,
    notes,
    setNotes: updateNotes,
    rangeStart,
    setRangeStart: updateRangeStart,
    rangeEnd,
    setRangeEnd: updateRangeEnd,
    calendarCells,
    isToday,
    isInRange,
    isRangeStart,
    isRangeEnd,
    getHolidayName,
    handleDateCellClick,
  };
}
