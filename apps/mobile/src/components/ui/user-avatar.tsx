import { Avatar } from 'react-native-paper';

import { useAvatar } from '@/hooks/use-profile';
import { authClient } from '@/lib/auth-client';
import { useAppTheme } from '@/theme';
import { initials } from '@/utils/greeting';

// The signed-in user's photo, or their initials when there is none.
export function UserAvatar({ size }: { size: number }) {
  const { brand } = useAppTheme();
  const { data: session } = authClient.useSession();
  const url = useAvatar().data?.url;
  if (url) return <Avatar.Image size={size} source={{ uri: url }} accessibilityIgnoresInvertColors />;
  return <Avatar.Text size={size} label={initials(session?.user.name)} style={{ backgroundColor: brand.motif }} color={brand.onBrand} />;
}
