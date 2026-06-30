import CardPaymentScreen from '@/components/CardPaymentScreen';
export default function ChildrenCardPaymentPage() {
  return <CardPaymentScreen nextPage="/children-payment-completion" backPage="/children-payment-method" userType="children" />;
}
