import { authClient } from '@/lib/auth-client';

// Family sharing = Better Auth organizations. The owner's whole garage is shared with every member;
// members join with the "member" role only (enforced by the API).

type Result<T> = { data: T | null; error: { message?: string } | null };

async function unwrap<T>(call: Promise<Result<T>>, fallback: string): Promise<T> {
  const { data, error } = await call;
  if (error || data == null) throw new Error(error?.message || fallback);
  return data;
}

const org = authClient.organization;

export type Family = Awaited<ReturnType<typeof familyApi.get>>;
export type FamilyMember = Family['members'][number];
export type PendingInvite = Family['invitations'][number];

/** What an invite QR code / link carries; app.json "scheme" + the invite/[id] route. */
export const inviteLink = (invitationId: string) => `rideready://invite/${invitationId}`;

export const familyApi = {
  get: (organizationId: string) =>
    unwrap(org.getFullOrganization({ query: { organizationId } }), "Couldn't load the family."),

  /** Every family the user is in; the owner's role tells whether it's theirs. */
  async list(userId: string) {
    const orgs = await unwrap(org.list(), "Couldn't load your family.");
    const families = await Promise.all(orgs.map((o) => familyApi.get(o.id)));
    const ownerOf = (f: Family) => f.members.find((m) => m.role === 'owner');
    return {
      own: families.find((f) => ownerOf(f)?.userId === userId) ?? null,
      joined: families.filter((f) => ownerOf(f)?.userId !== userId).map((f) => ({ ...f, owner: ownerOf(f) })),
    };
  },

  create: (userId: string, ownerName: string) =>
    unwrap(org.create({ name: `${ownerName}'s family`, slug: `family-${userId}` }), "Couldn't create your family."),

  invite: (organizationId: string, email: string) =>
    unwrap(org.inviteMember({ organizationId, email, role: 'member' }), "Couldn't create the invitation."),

  cancelInvite: (invitationId: string) => unwrap(org.cancelInvitation({ invitationId }), "Couldn't cancel the invitation."),

  removeMember: (organizationId: string, memberId: string) =>
    unwrap(org.removeMember({ organizationId, memberIdOrEmail: memberId }), "Couldn't remove this member."),

  leave: (organizationId: string) => unwrap(org.leave({ organizationId }), "Couldn't leave the family."),

  /** Pending invitations sent to the signed-in user's email. */
  forMe: () => unwrap(org.listUserInvitations(), "Couldn't load your invitations."),

  /** Only the invited email can read it. */
  invitation: (id: string) => unwrap(org.getInvitation({ query: { id } }), 'This invitation is not for this account, or it has expired.'),

  accept: (invitationId: string) => unwrap(org.acceptInvitation({ invitationId }), "Couldn't join the family."),

  decline: (invitationId: string) => unwrap(org.rejectInvitation({ invitationId }), "Couldn't decline the invitation."),
};
