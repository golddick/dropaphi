import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { customAlphabet } from 'nanoid'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 12)

export function dropid(prefix: string) {
  return `${prefix}_${nanoid()}`
}
