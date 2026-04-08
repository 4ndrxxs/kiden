#!/bin/bash
# ═══════════════════════════════════════════════
#  Kiden — OTA 업데이트 배포 스크립트
#
#  두 가지 배포 대상 지원:
#    1. GitHub Releases (기본) — 글로벌 CDN
#    2. 로컬 PC 서버 — LAN 내 빠른 배포
#
#  사용법:
#    bash scripts/publish-ota.sh              # GitHub Release
#    bash scripts/publish-ota.sh --local      # 로컬 PC 서버
#    bash scripts/publish-ota.sh --local /path/to/ota  # 커스텀 경로
# ═══════════════════════════════════════════════

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TIMESTAMP=$(date +%s)
VERSION=$(node -p "require('$PROJECT_DIR/app.json').expo.version")
RUNTIME_VERSION="$VERSION"
UPDATE_ID="kiden-${TIMESTAMP}"
MODE="github"
OTA_DIR=""

# 인자 파싱
while [[ $# -gt 0 ]]; do
  case $1 in
    --local)
      MODE="local"
      OTA_DIR="${2:-$PROJECT_DIR/../pc-server/ota}"
      if [[ -n "$2" && "$2" != --* ]]; then shift; fi
      ;;
    *)
      OTA_DIR="$1"
      ;;
  esac
  shift
done

echo "╔═══════════════════════════════════════╗"
echo "║   Kiden OTA Publisher                 ║"
echo "╚═══════════════════════════════════════╝"
echo ""
echo "  Mode:     $MODE"
echo "  Version:  $VERSION"
echo "  Runtime:  $RUNTIME_VERSION"
echo "  UpdateID: $UPDATE_ID"
echo ""

# ─── 1. JS 번들 export ───
echo "▸ [1/3] Metro 번들 export..."
cd "$PROJECT_DIR"
npx expo export --platform android --output-dir "$PROJECT_DIR/dist-ota"

# 번들 파일 찾기
BUNDLE_FILE=$(ls "$PROJECT_DIR/dist-ota/_expo/static/js/android/" 2>/dev/null | head -1)
if [ -z "$BUNDLE_FILE" ]; then
  echo "❌ 번들 파일을 찾을 수 없습니다"
  exit 1
fi

BUNDLE_PATH="$PROJECT_DIR/dist-ota/_expo/static/js/android/$BUNDLE_FILE"
BUNDLE_HASH=$(sha256sum "$BUNDLE_PATH" 2>/dev/null | cut -d' ' -f1 || shasum -a 256 "$BUNDLE_PATH" | cut -d' ' -f1)

if [ "$MODE" = "github" ]; then
  # ─── GitHub Releases 배포 ───
  echo ""
  echo "▸ [2/3] GitHub Release 업로드..."

  REPO=$(gh repo view --json nameWithOwner -q '.nameWithOwner' 2>/dev/null)
  if [ -z "$REPO" ]; then
    echo "❌ GitHub 레포를 찾을 수 없습니다. gh auth login을 먼저 실행하세요."
    exit 1
  fi

  OTA_TAG="ota-${VERSION}-${TIMESTAMP}"
  BUNDLE_URL="https://github.com/${REPO}/releases/download/${OTA_TAG}/${BUNDLE_FILE}"

  # GitHub Release 생성 + 번들 업로드
  gh release create "$OTA_TAG" "$BUNDLE_PATH" \
    --title "OTA Update ${VERSION} (${UPDATE_ID})" \
    --notes "자동 OTA 업데이트 번들 — 앱에서 자동 다운로드됩니다." \
    --prerelease

  # ─── manifest.json 생성 ───
  echo ""
  echo "▸ [3/3] manifest.json 생성 + 업로드..."

  MANIFEST_PATH="$PROJECT_DIR/dist-ota/manifest.json"
  cat > "$MANIFEST_PATH" << MANIFEST
{
  "id": "$UPDATE_ID",
  "createdAt": "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)",
  "runtimeVersion": "$RUNTIME_VERSION",
  "launchAsset": {
    "hash": "$BUNDLE_HASH",
    "key": "bundle",
    "contentType": "application/javascript",
    "url": "$BUNDLE_URL"
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

  # manifest도 같은 릴리즈에 업로드
  gh release upload "$OTA_TAG" "$MANIFEST_PATH" --clobber

  # 정리
  rm -rf "$PROJECT_DIR/dist-ota"

  echo ""
  echo "  ✓ OTA 업데이트 GitHub 배포 완료!"
  echo ""
  echo "  Release: https://github.com/${REPO}/releases/tag/${OTA_TAG}"
  echo "  Bundle:  $BUNDLE_URL"
  echo ""
  echo "  PC 서버 manifest 엔드포인트에서 이 URL을 프록시하세요:"
  echo "    GET /updates/manifest → manifest.json (위 릴리즈에서 다운로드)"
  echo ""

else
  # ─── 로컬 PC 서버 배포 ───
  echo ""
  echo "▸ [2/3] 로컬 OTA 디렉토리에 배포..."
  echo "  Target: $OTA_DIR"

  mkdir -p "$OTA_DIR/bundles"
  mkdir -p "$OTA_DIR/assets"

  cp -r "$PROJECT_DIR/dist-ota/_expo/static/js/android/"* "$OTA_DIR/bundles/" 2>/dev/null || true
  cp -r "$PROJECT_DIR/dist-ota/assets/"* "$OTA_DIR/assets/" 2>/dev/null || true

  echo ""
  echo "▸ [3/3] manifest.json 생성..."

  cat > "$OTA_DIR/manifest.json" << MANIFEST
{
  "id": "$UPDATE_ID",
  "createdAt": "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)",
  "runtimeVersion": "$RUNTIME_VERSION",
  "launchAsset": {
    "hash": "$BUNDLE_HASH",
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

  rm -rf "$PROJECT_DIR/dist-ota"

  echo ""
  echo "  ✓ OTA 업데이트 로컬 배포 완료!"
  echo ""
  echo "  manifest: $OTA_DIR/manifest.json"
  echo "  bundle:   $OTA_DIR/bundles/$BUNDLE_FILE"
  echo ""
  echo "  PC 서버에서 다음 엔드포인트를 서빙하세요:"
  echo "    GET /updates/manifest  → manifest.json"
  echo "    GET /updates/bundles/* → 번들 파일"
  echo "    GET /updates/assets/*  → 에셋 파일"
  echo ""
fi
