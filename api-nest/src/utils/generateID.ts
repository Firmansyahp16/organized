import { customAlphabet } from 'nanoid';

export function generateID(startWith: string) {
  const numberPart = customAlphabet('0123456789', 3)();
  const letterPart = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 3)();
  return `${startWith}-${numberPart}-${letterPart}`;
}
