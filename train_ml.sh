#!/usr/bin/env bash
# MIRAGE AI / ML Model Training Runner
# Activates the isolated ML environment and executes the training pipeline

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -d "backend/.venv" ]; then
    echo "[!] Virtual environment not found. Please initialize with Python 3.12+ / 3.14."
    exit 1
fi

echo "=== MIRAGE AI / ML TRAINING PIPELINE ==="
source backend/.venv/bin/activate
python3 -m backend.ml.train_models "$@"
