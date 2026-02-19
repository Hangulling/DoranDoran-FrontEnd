export const conceptMap = (id: string | undefined): string => {
  switch (id) {
    case '1':
      return 'friend'
    case '2':
      return 'honey'
    case '3':
      return 'coworker'
    case '4':
      return 'senior'
    default:
      return 'friend'
  }
}

// 친밀도 매핑
const CLOSENESS_TEXT_MAP: Record<number, string> = {
  1: 'Polite',
  2: 'Friendly',
  3: 'Friendly',
}

export function getClosenessAsText(level: number): string {
  return CLOSENESS_TEXT_MAP[level]
}

export const getRouteIdByConcept = (conceptName: string): number => {
  switch (conceptName.toLowerCase()) {
    case 'friend':
      return 1
    case 'honey':
      return 2
    case 'coworker':
      return 3
    case 'senior':
      return 4
    default:
      return 1
  }
}
