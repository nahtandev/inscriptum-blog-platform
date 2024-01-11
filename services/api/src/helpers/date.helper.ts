import dayjs from "dayjs";

export function unixTimestamp() {
  return dayjs().unix();
}

export function unixTimestampToDateTime(timestamp: number) {
  return dayjs.unix(timestamp);
}
