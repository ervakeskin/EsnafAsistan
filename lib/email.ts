const INBOUND_DOMAIN = process.env.INBOUND_EMAIL_DOMAIN ?? "mail.esnafasistan.com"

export function makeForwardingAddress(shopId: string): string {
  const short = shopId.replace(/-/g, "").slice(0, 12)
  return `fatura-${short}@${INBOUND_DOMAIN}`
}

export type InboundEmailPayload = {
  from: string
  to: string
  subject: string
  text: string
  html: string
  attachments?: { filename: string; content: string; contentType: string }[]
}

export function parseSenderEmail(from: string): string {
  const match = from.match(/<([^>]+)>/) ?? from.match(/([^\s]+@[^\s]+)/)
  return match?.[1]?.toLowerCase() ?? from.toLowerCase()
}
