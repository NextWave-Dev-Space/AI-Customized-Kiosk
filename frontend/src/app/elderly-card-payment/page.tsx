import CardPaymentScreen from '@/components/CardPaymentScreen';
export default function ElderlyCardPaymentPage() {
  return <CardPaymentScreen nextPage="/elderly-payment-completion" backPage="/elderly-payment-method" userType="elderly" />;
}
