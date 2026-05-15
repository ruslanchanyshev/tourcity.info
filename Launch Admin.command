#!/bin/bash
# NASA (Network Admin & Smart Assistant) - TourCity Admin Launcher
# Designed for macOS

# 1. Get the directory of the script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR/tourcity-admin"

echo "--------------------------------------------------------"
echo "   🚀 ТУРСИТИ: ЗАПУСК ПАНЕЛИ УПРАВЛЕНИЯ (ADMIN)   "
echo "--------------------------------------------------------"
echo ""
echo "  [1/2] Запуск сервера и интерфейса..."

# 2. Start the dev server in the background
export PATH=$PATH:/opt/homebrew/bin
npm run dev
