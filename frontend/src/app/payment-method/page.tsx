import PaymentMethodScreen from '@/components/PaymentMethodScreen';
export default function PaymentMethodPage() {
  return <PaymentMethodScreen cardPage="/card-payment" barcodePage="/barcode-scanner" backPage="/dine-option" />;
}
