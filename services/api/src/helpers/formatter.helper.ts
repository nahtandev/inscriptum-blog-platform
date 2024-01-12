export function toStringValue(val: any): string {
  if (val === null || val === undefined) {
    throw new Error("[formatter]: cannot format a null or undefined value");
  }

  const stringValue = val.toString();

  if (stringValue === "[object Object]") {
    throw new Error("[formatter]: cannot format an object to string");
  }
  return stringValue;
}

export function toStringOrUndefValue(val: any): string | undefined {
  if (val === null || val === undefined) return undefined; // consider a null value as undefined

  const stringValue = val.toString();

  if (stringValue === "[object Object]") {
    throw new Error("[formatter]: cannot format an object to string");
  }
  return stringValue;
}

export function toNumberValue(val: any): number {
  const parsedNumber = Number(val);

  if (isNaN(parsedNumber)) {
    throw new Error("[formatter]: cannot format this value to number");
  }

  return parsedNumber;
}

export function toNumberOrUndefValue(val: any): number | undefined {
  if (val === undefined) return undefined;
  const parsedNumber = Number(val);

  if (isNaN(parsedNumber)) {
    throw new Error("[formatter]: cannot format this value to number");
  }

  return parsedNumber;
}

export function toBoolValue(val: any): boolean {
  const strValue = toStringValue(val);
  if (val === true || strValue === "true") return true;
  if (val === false || strValue === "false") return false;

  throw new Error("[formatter]: cannot format this value to boolean");
}
