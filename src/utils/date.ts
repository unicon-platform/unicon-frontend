import {
  DateArg,
  differenceInDays,
  differenceInHours,
  differenceInMilliseconds,
  format,
  formatDuration,
  formatRelative,
  intervalToDuration,
} from "date-fns";

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

export const formatIntervalDuration = (start: DateArg<Date>, end: DateArg<Date>) => {
  const duration = intervalToDuration({ start, end });
  if (Object.keys(duration).length === 0) {
    // If the duration is less than a second, the object will be empty (`{}`)
    // Hence, we calculate the milliseconds difference
    const msDiff = differenceInMilliseconds(end, start);
    return `${(msDiff / 1000.0).toFixed(3)} seconds`;
  }
  return formatDuration(duration, { format: ["hours", "minutes", "seconds"] });
};
