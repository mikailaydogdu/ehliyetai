import Constants from 'expo-constants';
import { Platform } from 'react-native';

const REWARDED_AD_UNIT_ID = 'ca-app-pub-9486767362549469/1499810426';

export type RewardedAdResult = 'rewarded' | 'shown' | 'dismissed' | 'error' | 'not_loaded';

/**
 * Ödüllü reklamı yükler ve gösterir. Sadece Android development/production build'de AdMob kullanır.
 * Expo Go'da native modül yok; reklam atlanır, onRewarded hemen çağrılır.
 */
export function showRewardedAd(options: {
  onRewarded: () => void;
  onDone?: (result: RewardedAdResult) => void;
}): void {
  // iOS / web veya Expo Go: reklam gösterme, doğrudan ödül ver (sınava geç)
  if (Platform.OS !== 'android' || Constants.appOwnership === 'expo') {
    options.onRewarded();
    options.onDone?.('rewarded');
    return;
  }

  import('react-native-google-mobile-ads').then(
    ({ RewardedAd, RewardedAdEventType, AdEventType }) => {
      const rewarded = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID);

      const unloadLoaded = rewarded.addAdEventListener(
        RewardedAdEventType.LOADED,
        () => {
          rewarded.show();
        }
      );

      const unloadEarned = rewarded.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          options.onRewarded();
        }
      );

      const unloadOpened = rewarded.addAdEventListener(
        AdEventType.OPENED,
        () => {
          options.onDone?.('shown');
        }
      );

      const unloadClosed = rewarded.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          unloadLoaded();
          unloadEarned();
          unloadOpened();
          unloadClosed();
          unloadFailed();
          options.onDone?.('dismissed');
        }
      );

      const unloadFailed = rewarded.addAdEventListener(
        AdEventType.ERROR,
        () => {
          unloadLoaded();
          unloadEarned();
          unloadOpened();
          unloadClosed();
          unloadFailed();
          options.onDone?.('error');
        }
      );

      // Load hatası AdEventType.ERROR listener ile yakalanıyor
      rewarded.load();
    }
  ).catch(() => {
    options.onDone?.('error');
  });
}
