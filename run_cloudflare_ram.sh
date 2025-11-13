#!/bin/bash

set -e

echo "Stopping any running containers..."
docker compose -f docker-compose.cloudflared.ram.yml down


echo "Starting RAM-optimized Cloudflare stack..."
docker compose -f docker-compose.cloudflared.ram.yml up --build -d

echo "All containers are up!"
docker compose -f docker-compose.cloudflared.ram.yml ps
