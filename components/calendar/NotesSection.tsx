"use client";

import { useMemo, useRef } from "react";
import { NOTE_SENTENCE_COLORS } from "@/lib/calendar/constants";

type NotesSectionProps = {
  notes: string;
  onNotesChange: (notes: string) => void;
  monoFontClassName: string;
  handwrittenFontClassName: string;
};

export function NotesSection({ notes, onNotesChange, monoFontClassName, handwrittenFontClassName }: NotesSectionProps) {
  const notesTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const notesOverlayRef = useRef<HTMLDivElement | null>(null);

  const coloredNotesNodes = useMemo(() => {
    if (!notes) {
      return null;
    }

    let colorIndex = 0;
    let buffer = "";
    let key = 0;
    const nodes: React.ReactNode[] = [];

    const flushBuffer = () => {
      if (!buffer) {
        return;
      }

      nodes.push(
        <span key={`note-segment-${key++}`} style={{ color: NOTE_SENTENCE_COLORS[colorIndex % NOTE_SENTENCE_COLORS.length] }}>
          {buffer}
        </span>
      );

      buffer = "";
      colorIndex += 1;
    };

    for (const character of notes) {
      if (character === "\n") {
        flushBuffer();
        nodes.push(<br key={`note-break-${key++}`} />);
        continue;
      }

      buffer += character;

      if (character === ".") {
        flushBuffer();
      }
    }

    flushBuffer();
    return nodes;
  }, [notes]);

  const handleNotesScroll = () => {
    if (!notesTextareaRef.current || !notesOverlayRef.current) {
      return;
    }

    notesOverlayRef.current.scrollTop = notesTextareaRef.current.scrollTop;
    notesOverlayRef.current.scrollLeft = notesTextareaRef.current.scrollLeft;
  };

  return (
    <div className="w-60 h-full flex flex-col items-start justify-center">
      <p className={`${monoFontClassName} underline`}>Notes</p>
      <div className="w-full h-64 mt-2 relative">
        <div
          ref={notesOverlayRef}
          aria-hidden="true"
          className={`${handwrittenFontClassName} absolute inset-0 overflow-hidden whitespace-pre-wrap wrap-break-word leading-7 pointer-events-none`}
        >
          {notes ? coloredNotesNodes : <span className="text-zinc-700/40">Write your notes here...</span>}
        </div>
        <textarea
          ref={notesTextareaRef}
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          onScroll={handleNotesScroll}
          onMouseDown={(event) => event.stopPropagation()}
          onTouchStart={(event) => event.stopPropagation()}
          className={`${handwrittenFontClassName} w-full h-full bg-transparent resize-none outline-none leading-7 relative text-transparent caret-zinc-900`}
          style={{
            WebkitTextFillColor: "transparent",
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='16'%20height='28'%20viewBox='0%200%2016%2028'%3E%3Cline%20x1='0'%20y1='27.5'%20x2='10'%20y2='27.5'%20stroke='rgba(11%2C31%2C85%2C0.35)'%20stroke-width='1'/%3E%3C/svg%3E\")",
            backgroundSize: "16px 28px",
            backgroundRepeat: "repeat",
          }}
        />
      </div>
    </div>
  );
}
