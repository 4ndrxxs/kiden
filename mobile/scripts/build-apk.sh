#!/bin/bash
# ═══════════════════════════════════════════════
#  Kiden — 로컬 APK 빌드 스크립트
#  사용법: bash scripts/build-apk.sh [debug|release]
# ═══════════════════════════════════════════════

set -e

MODE="${1:-release}"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "╔═══════════════════════════════════════╗"
echo "║   Kiden APK Builder (local)           ║"
echo "╚═══════════════════════════════════════╝"
echo ""
echo "  Mode: $MODE"
echo "  Project: $PROJECT_DIR"
echo ""

# 1. Android 네이티브 프로젝트 생성/갱신
echo "▸ [1/4] Prebuild (네이티브 프로젝트 생성)..."
cd "$PROJECT_DIR"
npx expo prebuild --platform android --clean

# 2. 빌드
echo ""
echo "▸ [2/4] Gradle 빌드 ($MODE)..."
cd "$PROJECT_DIR/android"

if [ "$MODE" = "release" ]; then
  ./gradlew assembleRelease --no-daemon
  APK_PATH="app/build/outputs/apk/release/app-release.apk"
else
  ./gradlew assembleDebug --no-daemon
  APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
fi

# 3. 결과 복사
echo ""
echo "▸ [3/4] APK 복사..."
mkdir -p "$PROJECT_DIR/build"
cp "$PROJECT_DIR/android/$APK_PATH" "$PROJECT_DIR/build/kiden-${MODE}.apk"

# 4. 완료
APK_SIZE=$(du -h "$PROJECT_DIR/build/kiden-${MODE}.apk" | cut -f1)
echo ""
echo "▸ [4/4] 완료!"
echo ""
echo "  ✓ APK: build/kiden-${MODE}.apk ($APK_SIZE)"
echo ""
echo "  설치: adb install build/kiden-${MODE}.apk"
echo ""
