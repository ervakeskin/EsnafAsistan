const MIN_LENGTH = 8

export interface PasswordPolicyResult {
  valid: boolean
  message: string
}

export function validatePassword(password: string): PasswordPolicyResult {
  if (password.length < MIN_LENGTH) {
    return { valid: false, message: `Şifre en az ${MIN_LENGTH} karakter olmalıdır.` }
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Şifre en az bir büyük harf içermelidir." }
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Şifre en az bir küçük harf içermelidir." }
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Şifre en az bir rakam içermelidir." }
  }

  return { valid: true, message: "" }
}
