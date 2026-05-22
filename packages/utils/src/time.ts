import { default as ms, type StringValue } from "ms";
import { IS_FINITE } from "./number";

export function MILLISECONDS(human: StringValue): number {
  const millisecond = ms(human);
  if (!IS_FINITE(millisecond)) {
    throw new Error(`Can not convert ${human} to milliseconds`);
  }
  return millisecond;
}

export function SECONDS(human: StringValue): number {
  return MILLISECONDS(human) / 1000;
}
