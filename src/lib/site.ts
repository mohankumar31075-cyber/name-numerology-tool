/** Shared site constants — plain data, safe to import from server and client. */

export const WHATSAPP_NUMBER = "919008831075";

export const SITE_NAME = "Jyotish One";

export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
