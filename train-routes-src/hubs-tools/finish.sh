#!/bin/sh
# Builds one show's train page once run_shows.py has printed SHOW DONE for it: extra legs, hubs, cfg, page.
set -e
cd "$(dirname "$0")"
timeout 900 python3 legs_for.py "$1" | tail -1
python3 build_hubs.py "$1" | grep -E "missing|skipped" | sed 's/.*\(missing positions.*\)/\1/' | cut -c1-300
python3 patch_cfg.py "$1"
cd .. && python3 build.py "$1"
