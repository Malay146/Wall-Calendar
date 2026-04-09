"use client";

import { useEffect, useState } from "react";
import { JetBrains_Mono, Patrick_Hand } from "next/font/google";
import { FlipCalendarBook } from "@/components/calendar/FlipCalendarBook";

const handwrittenFont = Patrick_Hand({
  subsets: ["latin"],
  weight: "400",
});

const calendarMonoFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function page() {
  const [baseDate, setBaseDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setBaseDate(new Date());
    }, 60_000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full min-h-screen flex items-center justify-center relative overflow-hidden">
      <FlipCalendarBook
        monoFontClassName={calendarMonoFont.className}
        handwrittenFontClassName={handwrittenFont.className}
        baseDate={baseDate}
      />
    </div>
  );
}
