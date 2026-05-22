import { URL_NEW } from "./url";

export function WHATSAPP_URL(phone: string, text?: string): URL {
  const digits = phone.replace(/\D/g, "");
  return URL_NEW(`https://wa.me/+${digits}`, undefined, text ? { params: { text } } : undefined);
}
