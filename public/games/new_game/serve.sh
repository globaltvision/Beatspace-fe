#!/usr/bin/env bash
cd "$(dirname "$0")"
echo "Serveur lancé. Ouvre ton navigateur sur :  http://localhost:8000"
echo "(Ctrl+C pour arrêter)"
python3 -m http.server 8000
