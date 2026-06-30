import BarcodeScannerScreen from '@/components/BarcodeScannerScreen';
export default function ChildrenBarcodeScannerPage() {
  return <BarcodeScannerScreen nextPage="/children-payment-completion" backPage="/children-payment-method" userType="children" />;
}
