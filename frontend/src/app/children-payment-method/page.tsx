import PaymentMethodScreen from '@/components/PaymentMethodScreen';
export default function ChildrenPaymentMethodPage() {
  return <PaymentMethodScreen cardPage="/children-card-payment" barcodePage="/children-barcode-scanner" backPage="/children-dine-option" />;
}
