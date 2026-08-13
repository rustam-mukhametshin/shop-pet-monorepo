import { createHmac, randomBytes } from 'crypto'

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
const OTP_DIGITS = 6
const OTP_STEP_SECONDS = 30

// TODO: remove when fixed
const encodeBase32 = (buffer: Buffer): string => {
  let bits = 0
  let value = 0
  let output = ''

  for (const byte of buffer) {
    value = (value << 8) | byte
    bits += 8

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31]
  }

  return output
}

const decodeBase32 = (input: string): Buffer => {
  const normalizedInput = input.toUpperCase().replace(/=+$/g, '').replace(/\s+/g, '')

  let bits = 0
  let value = 0
  const output: number[] = []

  for (const char of normalizedInput) {
    const charIndex = BASE32_ALPHABET.indexOf(char)
    if (charIndex === -1) {
      throw new Error('Invalid Base32 secret')
    }

    value = (value << 5) | charIndex
    bits += 5

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }

  return Buffer.from(output)
}

const generateHotp = (secret: string, counter: number): string => {
  const key = decodeBase32(secret)
  const counterBuffer = Buffer.alloc(8)
  counterBuffer.writeBigUInt64BE(BigInt(counter))

  const hash = createHmac('sha1', key).update(counterBuffer).digest()
  const offset = hash[hash.length - 1] & 0xf

  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff)

  return (binary % 10 ** OTP_DIGITS).toString().padStart(OTP_DIGITS, '0')
}

const generateTotp = (secret: string, unixSeconds: number): string => {
  const counter = Math.floor(unixSeconds / OTP_STEP_SECONDS)
  return generateHotp(secret, counter)
}

export const generateSecret = (bytes = 20): string => {
  return encodeBase32(randomBytes(bytes))
}

export const generateURI = ({
  secret,
  issuer,
  label,
}: {
  secret: string
  issuer: string
  label: string
}): string => {
  const encodedIssuer = encodeURIComponent(issuer)
  const encodedLabel = encodeURIComponent(label)

  return `otpauth://totp/${encodedIssuer}:${encodedLabel}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=${OTP_DIGITS}&period=${OTP_STEP_SECONDS}`
}

export const verify = ({
  secret,
  token,
  window = 1,
}: {
  secret: string
  token: string
  window?: number
}): { valid: boolean } => {
  if (!secret || !token) {
    return { valid: false }
  }

  const normalizedToken = token.trim()
  const currentUnixSeconds = Math.floor(Date.now() / 1000)

  for (let offset = -window; offset <= window; offset += 1) {
    const unixSeconds = currentUnixSeconds + offset * OTP_STEP_SECONDS
    if (generateTotp(secret, unixSeconds) === normalizedToken) {
      return { valid: true }
    }
  }

  return { valid: false }
}
