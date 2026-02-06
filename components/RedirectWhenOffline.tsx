import { router, usePathname } from 'expo-router';
import { useEffect } from 'react';

import { useNetwork } from '@/context/NetworkContext';

/**
 * Offline olduğunda /offline sayfasına yönlendirir.
 * Online olunca offline sayfasındaysak (tabs)'a geri döner.
 */
export function RedirectWhenOffline() {
  const pathname = usePathname();
  const { isConnected } = useNetwork();

  useEffect(() => {
    if (isConnected === null) return;

    if (isConnected === false) {
      if (!pathname?.includes('offline')) {
        router.replace('/offline');
      }
    } else {
      if (pathname === '/offline') {
        router.replace('/(tabs)');
      }
    }
  }, [isConnected, pathname]);

  return null;
}
