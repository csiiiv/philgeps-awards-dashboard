#!/bin/bash

echo "========================================"
echo "PhilGEPS System Optimization Script"
echo "Optimizing for 40-50 concurrent users"
echo "========================================"
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  This script requires sudo privileges for system optimizations."
    echo "Please run with: sudo ./optimize_system.sh"
    exit 1
fi

echo "📊 Current System Limits:"
echo "  File descriptors: $(ulimit -n)"
echo "  Max open files: $(cat /proc/sys/fs/file-max)"
echo ""

echo "🔧 Applying system optimizations..."

# Increase file descriptors
echo "  - Increasing file descriptor limits..."
sysctl -w fs.file-max=100000
sysctl -w fs.nr_open=100000

# Network optimizations for concurrent connections
echo "  - Optimizing network stack..."
sysctl -w net.core.somaxconn=4096
sysctl -w net.ipv4.tcp_max_syn_backlog=8192
sysctl -w net.ipv4.ip_local_port_range="1024 65535"
sysctl -w net.ipv4.tcp_tw_reuse=1
sysctl -w net.ipv4.tcp_fin_timeout=15
sysctl -w net.ipv4.tcp_keepalive_time=600
sysctl -w net.ipv4.tcp_keepalive_intvl=60
sysctl -w net.ipv4.tcp_keepalive_probes=3

# Docker/VM optimizations
echo "  - Optimizing for containerized workloads..."
sysctl -w vm.max_map_count=262144
sysctl -w vm.swappiness=10

# Make changes persistent
echo "  - Making changes persistent..."
cat >> /etc/sysctl.conf << 'EOF'

# PhilGEPS Dashboard Optimizations (added $(date '+%Y-%m-%d'))
fs.file-max=100000
fs.nr_open=100000
net.core.somaxconn=4096
net.ipv4.tcp_max_syn_backlog=8192
net.ipv4.ip_local_port_range=1024 65535
net.ipv4.tcp_tw_reuse=1
net.ipv4.tcp_fin_timeout=15
net.ipv4.tcp_keepalive_time=600
net.ipv4.tcp_keepalive_intvl=60
net.ipv4.tcp_keepalive_probes=3
vm.max_map_count=262144
vm.swappiness=10
EOF

# Apply all sysctl settings
sysctl -p

echo ""
echo "✅ System optimization complete!"
echo ""
echo "📊 Updated System Limits:"
echo "  File descriptors: $(cat /proc/sys/fs/file-max)"
echo "  Max connections: $(cat /proc/sys/net/core/somaxconn)"
echo "  TCP backlog: $(cat /proc/sys/net/ipv4/tcp_max_syn_backlog)"
echo ""
echo "🚀 System is now optimized for high concurrent user load."
echo "You can now start your Docker containers with:"
echo "  docker compose -f docker-compose.cloudflared.ram.yml up -d"
echo ""
