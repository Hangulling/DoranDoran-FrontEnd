import type { ArchiveEntry, Closeness } from '../types/archive'

export const archiveData: ArchiveEntry[] = [
  {
    key: 'sentences',
    title: 'Sentences',
    description: 'Real-life phrases from your conversations',
    to: '/archive/sentences',
    bgColor: '#6C51F0',
  },
  {
    key: 'words',
    title: 'Words',
    description: 'Words Koreans actually use in daily life',
    to: '/archive/words',
    bgColor: '#61C8EA',
  },
]

export const archiveCardStyle: Record<
  Closeness,
  {
    border: string
    text: string
    bgColor: string
    wordBorder: string
  }
> = {
  Polite: {
    border: 'border-secondary-200',
    text: 'text-secondary-300',
    bgColor: 'bg-secondary-50',
    wordBorder: 'border-secondary-50',
  },
  Friendly: {
    border: 'border-primary-100',
    text: 'text-primary-200',
    bgColor: 'bg-primary-10',
    wordBorder: 'border-primary-50',
  },
}

export function toCloseness(intimacyLevel: string): Closeness {
  if (intimacyLevel.includes('Polite')) return 'Polite'
  return 'Friendly'
}
