import * as Updates from 'expo-updates';
import { Alert, Platform } from 'react-native';

/**
 * OTA 업데이트 관리 유틸리티
 *
 * 자체 호스팅 방식: PC FastAPI 서버 (9001)에서 업데이트 번들 서빙
 * 앱 시작 시 자동 체크 + 수동 체크 지원
 */

export interface UpdateStatus {
  isAvailable: boolean;
  isDownloading: boolean;
  isReady: boolean;
  currentVersion: string;
  error?: string;
}

/** 현재 업데이트 정보 */
export function getCurrentUpdateInfo() {
  if (!Updates.isEnabled) {
    return {
      updateId: 'development',
      channel: 'dev',
      runtimeVersion: '1.0.0',
      isEmbeddedLaunch: true,
    };
  }

  return {
    updateId: Updates.updateId ?? 'embedded',
    channel: Updates.channel ?? 'production',
    runtimeVersion: Updates.runtimeVersion ?? '1.0.0',
    isEmbeddedLaunch: Updates.isEmbeddedLaunch,
    createdAt: Updates.createdAt,
  };
}

/** 업데이트 체크 + 다운로드 + 적용 (백그라운드) */
export async function checkAndApplyUpdate(silent = true): Promise<UpdateStatus> {
  // 개발 모드에서는 OTA 비활성
  if (!Updates.isEnabled) {
    return {
      isAvailable: false,
      isDownloading: false,
      isReady: false,
      currentVersion: '1.0.0 (dev)',
    };
  }

  try {
    const check = await Updates.checkForUpdateAsync();

    if (!check.isAvailable) {
      return {
        isAvailable: false,
        isDownloading: false,
        isReady: false,
        currentVersion: Updates.runtimeVersion ?? '1.0.0',
      };
    }

    // 업데이트 발견 — 다운로드
    const download = await Updates.fetchUpdateAsync();

    if (download.isNew) {
      if (!silent) {
        // 사용자에게 알림
        Alert.alert(
          '업데이트 완료',
          '새로운 버전이 준비되었습니다.\n앱을 다시 시작하면 적용됩니다.',
          [
            { text: '나중에', style: 'cancel' },
            {
              text: '지금 적용',
              onPress: () => Updates.reloadAsync(),
            },
          ],
        );
      }

      return {
        isAvailable: true,
        isDownloading: false,
        isReady: true,
        currentVersion: Updates.runtimeVersion ?? '1.0.0',
      };
    }

    return {
      isAvailable: false,
      isDownloading: false,
      isReady: false,
      currentVersion: Updates.runtimeVersion ?? '1.0.0',
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);

    if (!silent) {
      Alert.alert('업데이트 실패', `서버에 연결할 수 없습니다.\n${msg}`);
    }

    return {
      isAvailable: false,
      isDownloading: false,
      isReady: false,
      currentVersion: Updates.runtimeVersion ?? '1.0.0',
      error: msg,
    };
  }
}

/** 즉시 재로드 (업데이트 다운로드 완료 후) */
export async function applyUpdateNow() {
  if (Updates.isEnabled) {
    await Updates.reloadAsync();
  }
}

/**
 * useUpdates hook을 re-export.
 * 컴포넌트에서 업데이트 상태를 실시간 추적할 때 사용.
 *
 * 사용 예:
 *   const { isUpdateAvailable, isUpdatePending } = Updates.useUpdates();
 */
export const useUpdates = Updates.useUpdates;
