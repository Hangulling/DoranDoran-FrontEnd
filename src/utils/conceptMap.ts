export const conceptMap = (id: string | undefined): string => {
  switch (id) {
    case '1':
      return 'friend'
    case '2':
      return 'honey'
    case '3':
      return 'senior'
    case '4':
      return 'coworker'
    default:
      return 'friend'
  }
}
