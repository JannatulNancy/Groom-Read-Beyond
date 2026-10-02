/**
 * Customer Privacy & Anonymization Utilities
 * Masks sensitive customer personal details (Phone number, Full name, Private notes)
 * on the public storefront while allowing authenticated administrators to view
 * full unmasked data in the Admin Panel.
 */

/**
 * Masks customer name for public landing page display.
 * Examples:
 * "Tawfiq Hasan" -> "Tawfiq H***"
 * "Sadia" -> "Sa***"
 * "Mohammad Ali Jinnah" -> "Mohammad A*** J***"
 */
export function maskCustomerName(name?: string | null): string {
  if (!name || !name.trim()) {
    return 'Customer (Verified)';
  }

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    const single = parts[0];
    if (single.length <= 2) return `${single}***`;
    return `${single.slice(0, 3)}***`;
  }

  // First name visible up to first word or 3 chars, following names masked with initial + ***
  const first = parts[0];
  const firstDisplay = first.length > 3 ? `${first.slice(0, 4)}..` : first;
  const rest = parts
    .slice(1)
    .map((p) => `${p[0].toUpperCase()}***`)
    .join(' ');

  return `${firstDisplay} ${rest}`;
}

/**
 * Masks customer phone number for public landing page display.
 * Strictly prevents random visitors from harvesting or calling student numbers.
 * Examples:
 * "01712345678" -> "017••••••78"
 * "+8801712345678" -> "+880 17••••••78"
 */
export function maskPhoneNumber(phone?: string | null): string {
  if (!phone || !phone.trim()) {
    return '•••••••• (Protected)';
  }

  const clean = phone.trim();
  const digits = clean.replace(/\D/g, '');

  if (digits.length >= 7) {
    const prefix = digits.startsWith('880') ? '+880 ' + digits.slice(3, 5) : digits.slice(0, 3);
    const suffix = digits.slice(-2);
    return `${prefix}••••••${suffix}`;
  }

  return '•••••••• (Protected)';
}
