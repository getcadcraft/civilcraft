#!/bin/sh
# setup-dwg-readers.sh — installs the independent DWG readers that bin/test-civilcraft.mjs uses to check
# CivilCraft's DWG writer (dwg-write.js). Test tools only: nothing here ships with the site.
#
#   sh tools/civilcraft-test/setup-dwg-readers.sh            (as root; about 5 minutes, needs network)
#
# Everything lands in tools/civilcraft-test/venv/dwg-readers/ (git-ignored, like the Python venv):
#   libredwg/bin/dwgread, dwg2dxf  LibreDWG 0.14 command-line tools (GPL-3.0, GNU project)
#   libdxfrw/dwg2dxf               libdxfrw, LibreCAD's DWG/DXF library (GPL-2.0+), pinned commit
#   oda/AppRun                     ODA File Converter (freeware from the Open Design Alliance; its own
#                                  licence terms at opendesign.com — downloaded, not redistributed), run
#                                  headless under xvfb-run
# System packages used: gcc g++ make pkg-config curl git xz-utils xvfb libopengl0 libegl1
# libxkbcommon-x11-0 libxcb-cursor0 libxcb-icccm4 libxcb-image0 libxcb-keysyms1 libxcb-render-util0
# libxcb-xinerama0 libxcb-shape0.
set -eu
HERE=$(cd "$(dirname "$0")" && pwd)
DEST="$HERE/venv/dwg-readers"
mkdir -p "$DEST/src"
cd "$DEST/src"

if command -v apt-get >/dev/null 2>&1; then
  DEBIAN_FRONTEND=noninteractive apt-get install -y gcc g++ make pkg-config curl git xz-utils xvfb libopengl0 libegl1 \
    libxkbcommon-x11-0 libxcb-cursor0 libxcb-icccm4 libxcb-image0 libxcb-keysyms1 libxcb-render-util0 libxcb-xinerama0 libxcb-shape0 >/dev/null
fi

# 1. LibreDWG 0.14
if [ ! -x "$DEST/libredwg/bin/dwgread" ]; then
  curl -sSLO https://ftp.gnu.org/gnu/libredwg/libredwg-0.14.tar.xz
  echo "62ebb73b984f865960f20ed26619ea5f8789d5e3fd088fa40a2598384da81275  libredwg-0.14.tar.xz" | sha256sum -c -
  tar xf libredwg-0.14.tar.xz
  (cd libredwg-0.14 && ./configure --prefix="$DEST/libredwg" --disable-bindings --disable-python --disable-shared >/dev/null && make -j"$(nproc)" >/dev/null && make install >/dev/null)
fi

# 2. libdxfrw (LibreCAD), built straight with g++
if [ ! -x "$DEST/libdxfrw/dwg2dxf" ]; then
  rm -rf libdxfrw && git clone -q https://github.com/LibreCAD/libdxfrw.git libdxfrw
  (cd libdxfrw && git checkout -q 25a2f8d5544d5d0311aa8fee477304b93abc877e)
  mkdir -p "$DEST/libdxfrw"
  g++ -O1 -std=c++17 -w -Ilibdxfrw/src -Ilibdxfrw/src/intern libdxfrw/src/*.cpp libdxfrw/src/intern/*.cpp \
    libdxfrw/dwg2dxf/dx_iface.cpp libdxfrw/dwg2dxf/main.cpp -o "$DEST/libdxfrw/dwg2dxf"
fi

# 3. ODA File Converter (Qt 6 AppImage, extracted so it runs without FUSE)
if [ ! -x "$DEST/oda/AppRun" ]; then
  curl -sSL -o oda.AppImage 'https://www.opendesign.com/guestfiles/get?filename=ODAFileConverter_QT6_lnxX64_11dll.AppImage'
  chmod +x oda.AppImage && rm -rf squashfs-root && ./oda.AppImage --appimage-extract >/dev/null
  rm -rf "$DEST/oda" && mv squashfs-root "$DEST/oda"
fi

echo "DWG readers ready in $DEST"
