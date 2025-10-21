export function timeStringToDate(time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date(1970, 0, 1, hours, minutes);
  return date;
}