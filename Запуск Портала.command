#!/bin/bash
cd "/Users/rch/tourcity.info/tourcity-admin/backend"
echo "--- Запуск Сервера TourCity ---"
pkill -f "node server.js"
node server.js &

sleep 2

echo "--- Запуск Туннеля Cloudflare ---"
pkill -f "cloudflared tunnel"
cloudflared tunnel --config tunnel_config.yaml run &

echo "--- ВСЁ ЗАПУЩЕНО! ---"
echo "Портал доступен по адресу: tourcity.info/partner"
echo "Не закрывайте это окно терминала, если хотите, чтобы сервер работал."
