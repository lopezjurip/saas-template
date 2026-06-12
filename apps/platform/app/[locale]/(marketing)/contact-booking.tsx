"use client";

import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ROUTE } from "~/lib/route";

const DATES = ["02", "03", "04", "05", "06"];
const TIMESLOTS = ["09:30", "11:00", "13:30", "15:00", "16:30"];

type ContactBookingProps = {
  locale: string;
  labels: { week: string; timezone: string; book: string; write: string };
  days: string[];
};

export function ContactBooking({ locale, labels, days }: ContactBookingProps) {
  const [selectedDay, setSelectedDay] = useState(2);
  const [selectedSlot, setSelectedSlot] = useState("11:00");

  return (
    <div className="flex min-w-0 flex-col gap-4 rounded-lg border border-border bg-background p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm/normal font-medium">{labels.week}</span>
        <span className="font-mono text-xs text-muted-foreground">{labels.timezone}</span>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {days.map((day, index) => {
          const active = index === selectedDay;
          return (
            <button
              key={day}
              type="button"
              aria-pressed={active}
              onClick={() => setSelectedDay(index)}
              className={cn(
                "flex min-w-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-md border border-border py-2 transition-colors",
                "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active ? "border-foreground bg-foreground text-background" : "bg-background",
              )}
            >
              <span className="text-tiny font-medium uppercase tracking-[0.04em] opacity-80">{day}</span>
              <span className="text-sm font-semibold tabular-nums">{DATES[index]}</span>
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {TIMESLOTS.map((slot) => {
          const active = slot === selectedSlot;
          return (
            <button
              key={slot}
              type="button"
              aria-pressed={active}
              onClick={() => setSelectedSlot(slot)}
              className={cn(
                "h-9 cursor-pointer rounded-md border border-border font-mono text-sm/normal font-medium tabular-nums transition-colors",
                "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active ? "border-foreground bg-foreground text-background" : "bg-background",
              )}
            >
              {slot}
            </button>
          );
        })}
      </div>
      <div className="mt-1 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
        <Button asChild className="cursor-pointer sm:flex-1">
          <Link href={ROUTE("/[locale]/auth", { locale })}>
            {labels.book}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="cursor-pointer">
          <a href="mailto:hola@example.com">
            <Mail aria-hidden="true" className="h-4 w-4" />
            {labels.write}
          </a>
        </Button>
      </div>
    </div>
  );
}
