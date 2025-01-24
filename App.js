import { LoadNeedsProvider } from "./hooks/LoadNeedsContext";
import AppNavigation from "./navigations/AppNavigation";
import registerNNPushToken from 'native-notify';


export default function App() {
  registerNNPushToken(24234, 'cdRv8YPtH70BLWHy8pwHkS');

  return (
    <LoadNeedsProvider>
      <AppNavigation />
    </LoadNeedsProvider>
  );
}
