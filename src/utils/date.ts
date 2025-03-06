import { DateArg, differenceInDays, differenceInHours, format, formatRelative } from "date-fns";

export const formatDateShort = (date: DateArg<Date> & {}) => format(date, "dd MMM yyyy HH:mm");

export const formatDateLong = (date: DateArg<Date> & {}) => format(date, "EEEE, dd MMMM yyyy, HH:mm");

export const relativeTime = (date: DateArg<Date>, baseDate: DateArg<Date> = new Date()) => {
  return Math.abs(differenceInDays(date, baseDate)) < 6
    ? formatRelative(date, baseDate)
    : format(date, `dd MMM yyyy, HH:mm:ss`);
};

export const relativeTimeDetailed = (date: DateArg<Date>, baseDate: DateArg<Date> = new Date()) => {
  const isOver = date < baseDate;
  return Math.abs(differenceInDays(date, baseDate)) < 6
    ? formatRelative(date, baseDate)
    : isOver
      ? `${differenceInDays(baseDate, date)} day(s), ${differenceInHours(baseDate, date) % 24} hour(s) since`
      : `${differenceInDays(date, baseDate)} day(s), ${differenceInHours(date, baseDate) % 24} hour(s) left`;
};
