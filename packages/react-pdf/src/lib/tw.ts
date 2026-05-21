import { type ClassValue, clsx } from "clsx";
import { createTw } from "react-pdf-tailwind";

const twBase = createTw({});

export function tw(...inputs: ClassValue[]) {
  const className = clsx(inputs);
  return className ? twBase(className) : {};
}
