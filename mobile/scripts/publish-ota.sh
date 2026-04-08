#!/bin/bash
# ═══════════════════════════════════════════════
#  Kiden — 자체 호스팅 OTA 업데이트 배포 스크립트
#
#  이 스크립트는:
#  1. JS 번들을 export
#  2. 번들을 PC 서버의 OTA 디렉토리에 복사
#  3. manifest.json 생성 (expo-updates 프로토콜)
#
#  사용법: bash scripts/publish-ota.sh [서버경로]
#  예시:   bash scripts/publish-ota.sh /path/to/pc-server/ota
# ═══════════════════════════════════════════════

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OTA_DIR="${1:-$PROJECT_DIR/../pc-server/ota}"
TIMESTAMP=$(date +%s)
VERSION=$(node -p "require('$PROJECT_DIR/app.json').expo.version")
RUNTIME_VERSION="$VERSION"
UPDATE_ID="kiden-${TIMESTAMP}"

echo "╔═══════════════════════════════════════╗"
echo "║   Kiden OTA Publisher (self-hosted)   ║"
echo "╚═══════════════════════════════════════╝"
echo ""
echo "  Version:  $VERSION"
echo "  Runtime:  $RUNTIME_VERSION"
echo "  UpdateID: $UPDATE_ID"
echo "  Target:   $OTA_DIR"
echo ""

# 1. JS 번들 export
echo "▸ [1/3] Metro 번들 export..."
cd "$PROJECT_DIR"
npx expo export --platform android --output-dir "$PROJECT_DIR/dist-ota"

# 2. OTA 디렉토리에 복사
echo ""
echo "▸ [2/3] OTA 디렉토리에 배포..."
mkdir -p "$OTA_DIR/bundles"
mkdir -p "$OTA_DIR/assets"

# 번들 파일 복사
cp -r "$PROJECT_DIR/dist-ota/_expo/static/js/android/"* "$OTA_DIR/bundles/" 2>/dev/null || true
cp -r "$PROJECT_DIR/dist-ota/assets/"* "$OTA_DIR/assets/" 2>/dev/null || true

# 번들 파일명 찾기
BUNDLE_FILE=$(ls "$OTA_DIR/bundles/" | head -1)

# 3. manifest.json 생성 (Expo Updates 프로토콜)
echo ""
echo "▸ [3/3] manifest.json 생성..."

cat > "$OTA_DIR/manifest.json" << MANIFEST
{
  "id": "$UPDATE_ID",
  "createdAt": "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)",
  "runtimeVersion": "$RUNTIME_VERSION",
  "launchAsset": {
    "hash": "$(sha256sum "$OTA_DIR/bundles/$BUNDLE_FILE" 2>/dev/null | cut -d' ' -f1 || echo "local")",
    "key": "bundle",
    "contentType": "application/javascript",
    "url": "/updates/bundles/$BUNDLE_FILE"
  },
  "assets": [],
  "metadata": {
    "version": "$VERSION",
    "channel": "production"
  },
  "extra": {
    "expoClient": {
      "name": "키든",
      "slug": "kiden",
      "version": "$VERSION"
    }
  }
}
MANIFEST

# 정리
rm -rf "$PROJECT_DIR/dist-ota"

echo ""
echo "  ✓ OTA 업데이트 배포 완료!"
echo ""
echo "  manifest: $OTA_DIR/manifest.json"
echo "  bundle:   $OTA_DIR/bundles/$BUNDLE_FILE"
echo ""
echo "  PC 서버에서 다음 엔드포인트를 서빙하세요:"
echo "    GET /updates/manifest  → manifest.json"
echo "    GET /updates/bundles/* → 번들 파일"
echo "    GET /updates/assets/*  → 에셋 파일"
echo ""
