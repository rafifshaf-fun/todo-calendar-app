"use client";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { formatDate } from "@/lib/utils";

interface TaskCalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  taskDates: string[]; // Array of YYYY-MM-DD strings that have tasks
}

export default function TaskCalendar({
  selectedDate,
  onDateChange,
  taskDates,
}: TaskCalendarProps) {
  const taskDatesSet = new Set(taskDates);

  return (
    <div className="card">
      <Calendar
        onChange={(value) => {
          if (value instanceof Date) {
            onDateChange(value);
          }
        }}
        value={selectedDate}
        tileClassName={({ date, view }) => {
          if (view === "month") {
            const dateStr = formatDate(date);
            if (taskDatesSet.has(dateStr)) {
              return "react-calendar__tile--hasTasks";
            }
          }
          return null;
        }}
      />
    </div>
  );
}
