import { LaundryBrowser } from '@/src/components/laundry';
import { AppScreen } from '@/src/components/layout';

export default function ChooseLaundryScreen() {
  return (
    <AppScreen title="Choose a Laundry">
      <LaundryBrowser />
    </AppScreen>
  );
}
