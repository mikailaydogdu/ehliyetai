import Constants from 'expo-constants';
import { Platform } from 'react-native';

const REWARDED_AD_UNIT_ID_ANDROID = 'ca-app-pub-9486767362549469/1499810426';
const REWARDED_AD_UNIT_ID_IOS = 'ca-app-pub-9486767362549469/3391041820';

function getRewardedAdUnitId(): string {
  return Platform.OS === 'ios' ? REWARDED_AD_UNIT_ID_IOS : REWARDED_AD_UNIT_ID_ANDROID;
}

export type RewardedAdResult = 'rewarded' | 'shown' | 'dismissed' | 'error' | 'not_loaded';

/**
 * Loads and shows rewarded ad. Uses AdMob on Android/iOS dev/production build.
 * No native module in Expo Go; ad is skipped, onRewarded is called immediately.
 */
export function showRewardedAd(options: {
  onRewarded: () => void;
  onDone?: (result: RewardedAdResult) => void;
}): void {
  // Web or Expo Go: do not show ad, grant reward directly
  if (Platform.OS === 'web' || Constants.appOwnership === 'expo') {
    options.onRewarded();
    options.onDone?.('rewarded');
    return;
  }

  import('react-native-google-mobile-ads').then(
    ({ RewardedAd, RewardedAdEventType, AdEventType }) => {
      const rewarded = RewardedAd.createForAdRequest(getRewardedAdUnitId());

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

      // Load error is handled by AdEventType.ERROR listener
      rewarded.load();
    }
  ).catch(() => {
    options.onDone?.('error');
  });
}
