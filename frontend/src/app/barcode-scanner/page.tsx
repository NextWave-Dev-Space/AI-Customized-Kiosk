import BarcodeScannerScreen from '@/components/BarcodeScannerScreen';
export default function BarcodeScannerPage() {
  return <BarcodeScannerScreen nextPage="/payment-completion" backPage="/payment-method" userType="general" />;
}
