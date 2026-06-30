import BarcodeScannerScreen from '@/components/BarcodeScannerScreen';
export default function ElderlyBarcodeScannerPage() {
  return <BarcodeScannerScreen nextPage="/elderly-payment-completion" backPage="/elderly-payment-method" userType="elderly" />;
}
