import { z } from 'zod';

import { emailField } from '@/schemas/account.schema';

export const inviteSchema = z.object({ email: emailField });
export type InviteValues = z.infer<typeof inviteSchema>;
