// 첫번째 글자만 대문자로
export const capitalizeFirstLetter = (str: string) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
