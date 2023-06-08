export const trimStringInObject = (obj: any) => {
  Object.keys(obj).forEach((key) => {
    const value = obj[key]
    if (typeof value === 'string') {
      obj[key] = value.trim()
    }
  })

  return obj
}
