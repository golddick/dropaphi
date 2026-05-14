import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { customAlphabet } from 'nanoid'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const formatStorageLimit = (limitInMB: number): string => {
  if (limitInMB >= 1024) {
    const gb = limitInMB / 1024;
    return `${gb.toFixed(1)} GB`;
  }
  return `${limitInMB} MB`;
};