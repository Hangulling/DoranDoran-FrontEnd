export const validateName = (name: string): string | null => {
  const v = name.trim()
  if (v.length > 15) return 'You can enter up to 15 characters.'
  return null
}

export const EMAIL_REGEX_ASCII = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/

export const validateEmail = (email: string): string | null => {
  const v = email.trim()
  if (v.length === 0) return null

  if (/[^\u0020-\u007E]/.test(v)) {
    return 'Please enter a valid email address.'
  }

  const at = v.indexOf('@')
  if (at <= 0 || at === v.length - 1) return 'Please enter a valid email address.'

  const local = v.slice(0, at)
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) {
    return 'Please enter a valid email address.'
  }

  if (!EMAIL_REGEX_ASCII.test(v)) {
    return 'Please enter a valid email address.'
  }

  return null
}

export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/

export const validatePassword = (password: string, confirm: string): string | null => {
  const v = password.trim()

  if (v.length === 0) return null
  if (v.length < 8) return 'Must be at least 8 characters.'
  if (v.length > 20) return 'Must be 20 characters or fewer.'

  if (!PASSWORD_REGEX.test(v)) {
    return 'Please check your password format.'
  }

  if (confirm.length > 0 && v !== confirm) {
    return 'Passwords do not match.'
  }

  return null
}

export const isValidCalendarDate = (birthDate: string) => {
  if (birthDate.length < 8) {
    return 'Please enter the date of birth in 8 digits'
  }

  const y = Number(birthDate.slice(0, 4))
  const m = Number(birthDate.slice(4, 6))
  const d = Number(birthDate.slice(6, 8))

  const date = new Date(y, m - 1, d)

  const validDate = date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d

  if (!validDate) {
    return 'Please enter a valid date'
  }

  return null
}

export const isPastDate = (birthDate: string) => {
  if (birthDate.length < 8) {
    return 'Please enter the date of birth in 8 digits'
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const y = Number(birthDate.slice(0, 4))
  const m = Number(birthDate.slice(4, 6))
  const d = Number(birthDate.slice(6, 8))

  const validDate = new Date(y, m - 1, d) <= today

  if (!validDate) {
    return 'Please enter a valid date'
  }

  return null
}

export const ANSWER_REGEX = /^[A-Za-z0-9][A-Za-z0-9 ]*$/
