import { z } from 'zod';

import { emailField } from '@/schemas/account.schema';

export const inviteSchema = z.object({ email: emailField });
export type InviteValues = z.infer<typeof inviteSchema>;

/** The invitation id inside a scanned QR code, or null when it isn't a RideReady invite. */
export function invitationIdFrom(data: string) {
  const match = /^rideready:\/\/invite\/([A-Za-z0-9_-]{8,64})$/.exec(data.trim());
  return match ? match[1] : null;
}
