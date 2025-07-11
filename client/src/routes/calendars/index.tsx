import { Link, redirect } from "@tanstack/react-router";
import { isAuthenticated } from "../../libs/authenticated";
import AppLayout from "../../components/Layout";
import Header from "../../components/Header";
import Card from "../../components/Card";
import { useGetCalendar } from "../../hooks/calendar.hook";
import { useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, ToolbarProps } from "react-big-calendar";
import { format } from "date-fns/format";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import { id } from "date-fns/locale/id";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Display from "../../components/Display";

export const Route = createFileRoute({
  component: RouteComponent,
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
});

const locales = {
  "id-ID": id,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: id }),
  getDay,
  locales,
});

function CustomToolbar(props: ToolbarProps) {
  const goToBack = () => props.onNavigate("PREV");
  const goToNext = () => props.onNavigate("NEXT");
  const goToToday = () => props.onNavigate("TODAY");

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex gap-2">
        <button className="btn btn-sm" onClick={goToBack}>
          ‹
        </button>
        <button className="btn btn-sm" onClick={goToToday}>
          Today
        </button>
        <button className="btn btn-sm" onClick={goToNext}>
          ›
        </button>
      </div>
      <div className="text-lg font-semibold">{props.label}</div>
      <div className="flex gap-2">
        {(props.views as any[]).map((view) => (
          <button
            key={view}
            className={`btn btn-sm capitalize ${
              props.view === view ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => props.onView(view)}
          >
            {view}
          </button>
        ))}
      </div>
    </div>
  );
}

function Modal({
  event,
  onClose,
}: {
  event: Record<string, any>;
  onClose: () => void;
}) {
  return (
    <dialog className="modal" id={`modal-${event.id}`}>
      <div className="modal-box grid gap-5">
        <h3 className="font-bold text-lg text-center">{event.title}</h3>
        <div className="grid grid-cols-1 gap-5">
          <Display label="Date" value={event.start} isDate />
          <div>
            <p className="font-bold">
              {event.branches.length > 1 ? "Branches" : "Branch"}
            </p>
            {event.branches?.map((branch: string) => (
              <Link
                to="/branch/$id"
                className="hover:underline"
                params={{ id: branch }}
              >
                {branch}
              </Link>
            ))}
          </div>
        </div>
        <div className="modal-action">
          <button
            className="btn btn-outline btn-error"
            onClick={() => {
              const dialog = document.getElementById(
                `modal-${event.id}`
              ) as HTMLDialogElement;
              dialog?.close();
              onClose(); // Reset selectedEvent
            }}
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}

function RouteComponent() {
  const { data: calendarData } = useGetCalendar();
  const events = useMemo(() => {
    const schedules = calendarData?.schedules.map((schedule: any) => ({
      id: schedule.id,
      title: schedule.title,
      start: new Date(schedule.date),
      end: new Date(schedule.date),
      allDay: true,
      branches: schedule.branches,
      type: "schedule",
    }));
    const examinations = calendarData?.examinations.map((examination: any) => ({
      id: examination.id,
      title: examination.title,
      start: new Date(examination.date),
      end: new Date(examination.date),
      allDay: true,
      branches: examination.branches,
      type: "examination",
    }));
    const events = calendarData?.events.map((event: any) => ({
      id: event.id,
      title: event.title,
      start: new Date(event.date),
      end: new Date(event.date),
      allDay: true,
      branches: event.branches,
      type: "event",
    }));
    return [...(schedules || []), ...(examinations || []), ...(events || [])];
  }, [calendarData]);
  const [selectedEvent, setSelectedEvent] = useState<Record<
    string,
    any
  > | null>(null);
  return (
    <AppLayout>
      <Header name="Calendars" />
      <Card expanded>
        {selectedEvent && (
          <Modal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        )}
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={["month", "week", "day"]}
          style={{ height: 800 }}
          eventPropGetter={(event) => {
            let bgColor = "var(--color-base-200)";
            switch (event.type) {
              case "schedule":
                bgColor = "var(--color-primary)";
                break;
              case "examination":
                bgColor = "var(--color-accent)";
                break;
              case "events":
                bgColor = "var(--color-warning)";
                break;
            }
            return {
              className: "w-fit",
              style: {
                backgroundColor: bgColor,
                padding: "5px 10px",
                fontWeight: "bold",
                color: "white",
                margin: 4,
                borderRadius: 5,
                width: "fit-content",
              },
            };
          }}
          components={{
            toolbar: CustomToolbar,
            event: ({ event }) => (
              <div
                className="cursor-pointer w-fit"
                onClick={() => {
                  setSelectedEvent(event);
                  setTimeout(() => {
                    const dialog = document.getElementById(
                      `modal-${event.id}`
                    ) as HTMLDialogElement;
                    dialog?.showModal();
                  }, 0); // Tunggu 1 cycle supaya modal dirender dulu
                }}
              >
                {event.title}
              </div>
            ),
          }}
          messages={{
            next: "Next",
            previous: "Before",
            today: "Today",
            month: "Month",
            week: "Week",
            day: "Day",
            agenda: "Agenda",
            date: "Date",
            time: "Time",
            event: "Event",
            noEventsInRange: "No events in range",
          }}
        />
      </Card>
    </AppLayout>
  );
}
