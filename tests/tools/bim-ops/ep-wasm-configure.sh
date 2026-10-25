#!/bin/bash
# SPDX-License-Identifier: Apache-2.0
# bim-ops spike (0.7 LC.20 item 8): EnergyPlus v26.2.0 → WebAssembly (Node first), capped slice only
set -e
W=/var/www/CADCRAFT/work/energyplus-spike
source $W/emsdk/emsdk_env.sh > /dev/null 2>&1
export PATH=$W/tools-venv/bin:$PATH
emcmake cmake -S $W/src -B $W/build-wasm -G Ninja -DCMAKE_BUILD_TYPE=Release \
  -DOPENGL_REQUIRED=OFF -DBUILD_STATIC_ENERGYPLUS_API=ON -DLINK_WITH_PYTHON=OFF -DBUILD_FORTRAN=OFF -DBUILD_TESTING=OFF \
  -DENABLE_PCH=OFF -DCMAKE_POLICY_VERSION_MINIMUM=3.5 \
  -DCMAKE_EXE_LINKER_FLAGS="-sNODERAWFS=1 -sALLOW_MEMORY_GROWTH=1 -sSTACK_SIZE=16MB -sEXIT_RUNTIME=1"
