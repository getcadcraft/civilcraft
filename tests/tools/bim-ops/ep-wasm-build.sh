#!/bin/bash
# SPDX-License-Identifier: Apache-2.0
# bim-ops spike: build the energyplus target, 3 jobs, logging; capped slice (rule 14)
W=/var/www/CADCRAFT/work/energyplus-spike
source $W/emsdk/emsdk_env.sh > /dev/null 2>&1
export PATH=$W/tools-venv/bin:$PATH
date -u +"start %FT%TZ"; uptime
ninja -C $W/build-wasm -j 3 energyplus
echo "ninja exit $?"; date -u +"end %FT%TZ"; uptime
