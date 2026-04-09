"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { CalendarSheet } from "@/components/calendar/CalendarSheet";

type FlipCalendarBookProps = {
  monoFontClassName: string;
  handwrittenFontClassName: string;
  baseDate: Date;
};

export function FlipCalendarBook({ monoFontClassName, handwrittenFontClassName, baseDate }: FlipCalendarBookProps) {
  const monthDates = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => {
      const day = index === 0 ? baseDate.getDate() : 1;
      return new Date(baseDate.getFullYear(), baseDate.getMonth() + index, day);
    });
  }, [baseDate]);

  const [activePage, setActivePage] = useState(0);
  const [flipState, setFlipState] = useState<{ from: number; to: number } | null>(null);
  const flipLayerRef = useRef<HTMLDivElement | null>(null);
  const shadowLayerRef = useRef<HTMLDivElement | null>(null);
  const highlightLayerRef = useRef<HTMLDivElement | null>(null);
  const baseShadowRef = useRef<HTMLDivElement | null>(null);
  const edgeLayerRef = useRef<HTMLDivElement | null>(null);

  const activeMonth = monthDates[activePage] ?? monthDates[0];

  const goToPrevious = () => {
    if (flipState || activePage <= 0) {
      return;
    }

    setFlipState({ from: activePage, to: activePage - 1 });
  };

  const goToNext = () => {
    if (flipState || activePage >= monthDates.length - 1) {
      return;
    }

    setFlipState({ from: activePage, to: activePage + 1 });
  };

  const isFlipping = flipState !== null;
  const fromMonth = flipState ? monthDates[flipState.from] : null;
  const toMonth = flipState ? monthDates[flipState.to] : null;
  const isNextFlip = flipState ? flipState.to > flipState.from : false;

  const getStorageKeyPrefix = (date: Date) => {
    return `wall-calendar-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  };

  const getMonthImageSrc = (date: Date) => {
    const monthIndex = date.getMonth() + 1;
    return `/image-${monthIndex}.jpg`;
  };

  const getMonthCardColor = (date: Date) => {
    const monthPalette = [
      "#dbeafe", // Jan - pale sky
      "#e0f2fe", // Feb - mist blue
      "#e2f5ea", // Mar - pale green
      "#fff1d6", // Apr - warm sand
      "#d1d5db", // May - slightly darker light gray
      "#e4ffe9", // Jun - cloud blue
      "#e8f3e0", // Jul - soft sage
      "#f7e6c4", // Aug - light apricot
      "#e2ecff", // Sep - cool blue
      "#ffe2e6", // Oct - parchment
      "#dfefff", // Nov - pale horizon
      "#e5e7eb", // Dec - winter sky
    ];

    return monthPalette[date.getMonth()] ?? "#dbeafe";
  };

  useEffect(() => {
    if (!flipState || !flipLayerRef.current || !shadowLayerRef.current || !highlightLayerRef.current || !baseShadowRef.current || !edgeLayerRef.current) {
      return;
    }

    const startAngle = isNextFlip ? 0 : 180;
    const overshootAngle = isNextFlip ? 248 : -8;
    const targetAngle = isNextFlip ? 180 : 0;

    gsap.set(flipLayerRef.current, {
      rotateX: startAngle,
      y: 0,
      rotateZ: 0,
      z: 0,
      transformOrigin: "50% 0%",
      transformPerspective: 2200,
    });
    gsap.set(shadowLayerRef.current, { opacity: 0 });
    gsap.set(highlightLayerRef.current, { opacity: 0 });
    gsap.set(baseShadowRef.current, { opacity: 0.08, scaleY: 1 });
    gsap.set(edgeLayerRef.current, { opacity: 0 });

    const timeline = gsap.timeline({
      onComplete: () => {
        const targetPage = flipState.to;
        setActivePage(targetPage);

        // Keep the flip layer mounted for one paint so the next sheet is committed first.
        requestAnimationFrame(() => {
          setFlipState(null);
        });
      },
    });

    timeline
      .to(
        shadowLayerRef.current,
        {
          opacity: 0.45,
          duration: 0.26,
          ease: "power2.inOut",
        },
        0
      )
      .to(
        highlightLayerRef.current,
        {
          opacity: 0.32,
          duration: 0.2,
          ease: "power2.out",
        },
        0.04
      )
      .to(
        baseShadowRef.current,
        {
          opacity: 0.32,
          scaleY: 1.16,
          duration: 0.46,
          ease: "power2.out",
        },
        0
      )
      .to(
        edgeLayerRef.current,
        {
          opacity: 0.62,
          duration: 0.22,
          ease: "power2.out",
        },
        0.1
      )
      .to(
        flipLayerRef.current,
        {
          rotateX: overshootAngle,
          y: -16,
          rotateZ: isNextFlip ? 1.35 : -0.8,
          z: 0,
          duration: isNextFlip ? 0.88 : 0.72,
          ease: "expo.inOut",
        },
        0
      )
      .to(
        flipLayerRef.current,
        {
          rotateX: targetAngle,
          y: 0,
          rotateZ: 0,
          z: 0,
          duration: isNextFlip ? 0.2 : 0.24,
          ease: "power3.out",
        },
        isNextFlip ? 0.88 : 0.72
      )
      .to(
        shadowLayerRef.current,
        {
          opacity: 0,
          duration: 0.34,
          ease: "power2.inOut",
        },
        0.78
      )
      .to(
        highlightLayerRef.current,
        {
          opacity: 0,
          duration: 0.3,
          ease: "power2.inOut",
        },
        0.78
      )
      .to(
        baseShadowRef.current,
        {
          opacity: 0.08,
          scaleY: 1,
          duration: 0.34,
          ease: "power2.inOut",
        },
        0.78
      )
      .to(
        edgeLayerRef.current,
        {
          opacity: 0,
          duration: 0.3,
          ease: "power2.inOut",
        },
        0.78
      );

    return () => {
      timeline.kill();
    };
  }, [flipState]);

  return (
    <div className="w-140 overflow-visible shadow-2xl">
      <div className="w-140 flex items-center justify-between mb-2 px-1">
        <button
          type="button"
          onClick={goToPrevious}
          disabled={activePage === 0 || isFlipping}
          className="text-md font-medium tracking-tight px-4 py-2 disabled:opacity-40 rounded-2xl bg-neutral-200 "
        >
          Prev
        </button>
        <p className="text-xs">
          {(toMonth ?? activeMonth).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
        </p>
        <button
          type="button"
          onClick={goToNext}
          disabled={activePage === monthDates.length - 1 || isFlipping}
          className="text-md font-medium tracking-tight px-4 py-2 disabled:opacity-40 rounded-2xl bg-neutral-200 "
        >
          Next
        </button>
      </div>

      <div className="w-140 h-160 relative perspective-[2200px] transform-3d overflow-visible isolate">
        <div
          ref={baseShadowRef}
          className="absolute left-4 right-4 top-2 h-14 pointer-events-none"
          style={{
            opacity: 0.08,
            filter: "blur(14px)",
            background: "radial-gradient(ellipse at center, rgba(15, 23, 42, 0.34) 0%, rgba(15, 23, 42, 0) 72%)",
          }}
        />

        {flipState && fromMonth && toMonth ? (
          <div className="absolute inset-0 z-0">
            <CalendarSheet
              monthDate={isNextFlip ? toMonth : fromMonth}
              monoFontClassName={monoFontClassName}
              handwrittenFontClassName={handwrittenFontClassName}
              storageKeyPrefix={getStorageKeyPrefix(isNextFlip ? toMonth : fromMonth)}
              topImageSrc={getMonthImageSrc(isNextFlip ? toMonth : fromMonth)}
              cardBgColor={getMonthCardColor(isNextFlip ? toMonth : fromMonth)}
            />
          </div>
        ) : null}

        {fromMonth && toMonth && flipState ? (
          <div
            ref={flipLayerRef}
            className="absolute inset-0 z-40 origin-top transform-3d will-change-transform"
            style={{ transformStyle: "preserve-3d", transform: "translateZ(36px)" }}
          >
            <div
              ref={edgeLayerRef}
              className="absolute left-0 right-0 top-0 h-2 pointer-events-none z-20"
              style={{
                opacity: 0,
                background: "linear-gradient(to bottom, rgba(148, 163, 184, 0.9), rgba(148, 163, 184, 0.05))",
              }}
            />

            <div
              className="absolute inset-0"
              style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transformStyle: "preserve-3d", transform: "translateZ(0px)" }}
            >
              <CalendarSheet
                monthDate={isNextFlip ? fromMonth : toMonth}
                monoFontClassName={monoFontClassName}
                handwrittenFontClassName={handwrittenFontClassName}
                storageKeyPrefix={getStorageKeyPrefix(isNextFlip ? fromMonth : toMonth)}
                topImageSrc={getMonthImageSrc(isNextFlip ? fromMonth : toMonth)}
                cardBgColor={getMonthCardColor(isNextFlip ? fromMonth : toMonth)}
              />
            </div>

            <div
              className="absolute inset-0"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateX(180deg) translateZ(1px)",
                transformStyle: "preserve-3d",
              }}
            >
              <div className="w-140 h-160" style={{ backgroundColor: getMonthCardColor(fromMonth) }} />
            </div>

            <div
              ref={shadowLayerRef}
              className="absolute inset-0 pointer-events-none"
              style={{
                opacity: 0,
                background:
                  flipState.to > flipState.from
                    ? "linear-gradient(to bottom, rgba(15, 23, 42, 0.05) 0%, rgba(15, 23, 42, 0.4) 68%, rgba(15, 23, 42, 0.55) 100%)"
                    : "linear-gradient(to top, rgba(15, 23, 42, 0.05) 0%, rgba(15, 23, 42, 0.4) 68%, rgba(15, 23, 42, 0.55) 100%)",
              }}
            />

            <div
              ref={highlightLayerRef}
              className="absolute inset-0 pointer-events-none"
              style={{
                opacity: 0,
                background:
                  flipState.to > flipState.from
                    ? "linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.04) 35%, rgba(255, 255, 255, 0) 75%)"
                    : "linear-gradient(to top, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.04) 35%, rgba(255, 255, 255, 0) 75%)",
              }}
            />
          </div>
        ) : (
          <div className="absolute inset-0 z-0">
            <CalendarSheet
              monthDate={activeMonth}
              monoFontClassName={monoFontClassName}
              handwrittenFontClassName={handwrittenFontClassName}
              storageKeyPrefix={getStorageKeyPrefix(activeMonth)}
              topImageSrc={getMonthImageSrc(activeMonth)}
              cardBgColor={getMonthCardColor(activeMonth)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
