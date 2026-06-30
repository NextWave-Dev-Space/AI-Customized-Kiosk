import PaymentMethodScreen from '@/components/PaymentMethodScreen';
export default function ElderlyPaymentMethodPage() {
  return <PaymentMethodScreen cardPage="/elderly-card-payment" barcodePage="/elderly-barcode-scanner" backPage="/elderly-dine-option" />;
}
