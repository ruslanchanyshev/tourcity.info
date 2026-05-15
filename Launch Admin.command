#!/bin/bash
# NASA (Network Admin & Smart Assistant) - TourCity Full Stack Launcher
# Designed for macOS

# 1. Get the directory of the script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "--------------------------------------------------------"
echo "   🚀 ТУРСИТИ: ЗАПУСК ПОЛНОГО СЕРВЕРА (ALL-IN-ONE)   "
echo "--------------------------------------------------------"
echo ""

# 2. Cleanup existing processes
echo "  [1/4] Очистка старых процессов..."
pkill -f "node server.js"
pkill -f "cloudflared tunnel"
sleep 1

# 3. Start Cloudflare Tunnel in background
echo "  [2/4] Запуск туннеля Cloudflare (для партнеров)..."
cd "$DIR/tourcity-admin/backend"
cloudflared tunnel --config tunnel_config.yaml run > /dev/null 2>&1 &
echo "      ✅ Туннель запущен в фоновом режиме."

# 4. Start Admin Panel and Backend
echo "  [3/4] Запуск сервера базы данных и админки..."
cd "$DIR/tourcity-admin"
export PATH=$PATH:/opt/homebrew/bin
npm run dev
