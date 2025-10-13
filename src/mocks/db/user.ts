export interface User {
  email: string
  password: string
  name: string
  firstName: string
  lastName: string
  preferences: string
  createdAt: Date
  updatedAt: Date
}

// eslint-disable-next-line prefer-const
export let userProfile: User = {
  email: 'test@example.com',
  password: 'qwer1234',
  name: 'Eun Lee',
  firstName: 'Eun',
  lastName: 'Lee',
  preferences: '도란도란',
  createdAt: new Date('2025-09-01T09:00:00'),
  updatedAt: new Date('2025-09-20T14:30:00'),
}
