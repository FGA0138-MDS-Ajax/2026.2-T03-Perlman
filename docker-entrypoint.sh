#!/usr/bin/env bash
set -euo pipefail

: "${DB_URL:?Defina DB_URL com a URL JDBC do PostgreSQL}"
: "${DB_USER:?Defina DB_USER}"
: "${DB_PASSWORD:?Defina DB_PASSWORD}"
: "${JWT_SECRET:?Defina JWT_SECRET em Base64 (pelo menos 32 bytes)}"
: "${JWT_ISSUER:?Defina JWT_ISSUER}"
: "${CORS_ALLOWED_ORIGIN:?Defina a URL pública HTTPS, sem barra final}"

nginx -t -c /app/nginx.conf
java -jar /app/app.jar &
java_pid=$!
nginx -c /app/nginx.conf -g 'daemon off;' &
nginx_pid=$!

shutdown() {
    trap - TERM INT
    kill -TERM "$java_pid" "$nginx_pid" 2>/dev/null || true
    wait "$java_pid" "$nginx_pid" 2>/dev/null || true
}
trap 'shutdown; exit 0' TERM INT

# Se qualquer serviço terminar, encerre o outro e permita o reinício pelo Docker.
set +e
wait -n "$java_pid" "$nginx_pid"
status=$?
shutdown
if [ "$status" -eq 0 ]; then status=1; fi
exit "$status"
