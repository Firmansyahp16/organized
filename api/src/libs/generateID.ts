import { customAlphabet } from "nanoid";

export function generateID(startWith: string) {
  return `${startWith}-${customAlphabet("0123456789", 3)()}-${customAlphabet(
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    3
  )()}`;
}
