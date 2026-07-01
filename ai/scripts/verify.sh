#!/usr/bin/env bash
# verify.sh — Run all tests and build the project.
# Fails on first error (set -e).
set -euo pipefail

echo "=== Running tests ==="
npm run test:run

echo ""
echo "=== Building project ==="
npm run build

echo ""
echo "=== All checks passed ==="
