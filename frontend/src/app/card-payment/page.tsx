import CardPaymentScreen from '@/components/CardPaymentScreen';
export default function CardPaymentPage() {
  return <CardPaymentScreen nextPage="/payment-completion" backPage="/payment-method" userType="general" />;
}
