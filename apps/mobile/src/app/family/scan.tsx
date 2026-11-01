import { QrLinkScanner } from '@/components/qr-link-scanner';

export default function ScanInviteScreen() {
  return <QrLinkScanner hint="Point at the invite QR code" why="RideReady needs the camera to scan a family invite." />;
}
