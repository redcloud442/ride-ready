import { QrLinkScanner } from '@/components/qr-link-scanner';

export default function ScanTransferScreen() {
  return <QrLinkScanner hint="Point at the seller's transfer code" why="RideReady needs the camera to scan the seller's transfer code." />;
}
