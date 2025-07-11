import { compare, genSalt, hash } from 'bcryptjs';

export async function hashPassword(password: string, rounds: number) {
  const salt = await genSalt(rounds);
  return await hash(password, salt);
}

export async function comparePassword(password: string, hash: string) {
  const matched = await compare(password, hash);
  return matched;
}
