# ClaudeOS Bootable Image - Phase 3 Implementation Plan (Ubuntu Edition)

**Document Version:** 2.0
**Date:** 2026-01-12
**Status:** Planning Phase
**Target:** VMware-compatible bootable image using Ubuntu 24.04 LTS
**Prerequisites:** Claude.OS TINS README implementation complete

---

## Executive Summary

This document outlines the steps required to create a bootable VMware virtual machine image for ClaudeOS using **Ubuntu 24.04 LTS (Noble Numbat)** as the base operating system. This represents **Option D** in the base system selection, chosen for its production-grade stability, native systemd integration, and full glibc compatibility.

### Why Ubuntu 24.04 LTS?

| Factor | Ubuntu Advantage |
|--------|------------------|
| **Stability** | 10-year support lifecycle, enterprise-proven |
| **Compatibility** | Full glibc, no musl edge cases for Go binaries |
| **Systemd** | Native integration, no OpenRC translation needed |
| **Tooling** | Rich debugging tools, familiar to operators |
| **containerd** | First-class support, same as Docker Engine base |
| **Security** | AppArmor, UFW, automatic security updates |
| **Cloud-Ready** | Cloud-init native, works everywhere |

### Current State (Phase 2 Complete)

ClaudeOS core components are fully implemented:
- 5 binaries: `claude-agent`, `claude-reconciler`, `claude-observe`, `claude` (CLI), `claude-validator`
- Real system integrations: containerd, netlink, iptables, gopsutil
- Systemd service files ready in `rootfs/etc/systemd/system/`
- State directory structure in `rootfs/etc/claude.d/`
- JSON schemas in `rootfs/usr/share/claude/schemas/`

### Phase 3 Goal (Ubuntu Edition)

Create a bootable VMware VMDK image that:
1. Boots to Ubuntu 24.04 LTS minimal environment
2. Starts all ClaudeOS services automatically via systemd
3. Provides network connectivity for LLM API access
4. Allows SSH access for administration
5. Runs containerd for container workloads
6. Maintains minimal footprint (~400-500MB compressed)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     VMware Virtual Machine                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │            ClaudeOS on Ubuntu 24.04 LTS                   │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │  │
│  │  │ Linux 6.8+  │  │  initramfs  │  │   Root FS       │   │  │
│  │  │ (HWE/GA)    │  │  (Ubuntu)   │  │   (ext4)        │   │  │
│  │  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘   │  │
│  │         │                │                   │            │  │
│  │         └────────────────┼───────────────────┘            │  │
│  │                          │                                 │  │
│  │  ┌───────────────────────▼──────────────────────────────┐ │  │
│  │  │                   systemd (native)                    │ │  │
│  │  │  ┌────────────────┐ ┌────────────────┐ ┌───────────┐ │ │  │
│  │  │  │containerd.svc  │ │ claude-*.svc   │ │ sshd.svc  │ │ │  │
│  │  │  └────────────────┘ └────────────────┘ └───────────┘ │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  │                          │                                 │  │
│  │  ┌───────────────────────▼──────────────────────────────┐ │  │
│  │  │                 ClaudeOS Services                     │ │  │
│  │  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │ │  │
│  │  │  │ claude-agent │ │ claude-rec.  │ │ claude-obs.  │  │ │  │
│  │  │  └──────────────┘ └──────────────┘ └──────────────┘  │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Ubuntu-Specific Integrations:                                   │
│  • AppArmor profiles for ClaudeOS binaries                      │
│  • UFW integration via claude security.yaml                     │
│  • cloud-init for first-boot configuration                      │
│  • netplan for declarative networking                           │
│  • journald for unified logging                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Base System Selection: Option D - Ubuntu 24.04 LTS

### Comparison with Other Options

| Aspect | Alpine (A) | Debian (B) | Buildroot (C) | **Ubuntu (D)** |
|--------|------------|------------|---------------|----------------|
| Base Size | ~5MB | ~150MB | ~30MB | **~250MB** |
| Final Size | ~80MB | ~250MB | ~50MB | **~450MB** |
| C Library | musl | glibc | configurable | **glibc** |
| Init System | OpenRC | systemd | busybox/systemd | **systemd** |
| Package Manager | apk | apt | N/A | **apt** |
| LTS Support | 2 years | 5 years | N/A | **10 years** |
| Cloud-Init | manual | optional | manual | **native** |
| Enterprise Use | limited | common | embedded | **dominant** |

### Ubuntu 24.04 LTS Advantages for ClaudeOS

1. **Zero Translation Layer**: Systemd services from Phase 2 work as-is
2. **Proven containerd Stack**: Same base Ubuntu uses for Docker
3. **Debugging Familiarity**: Operators know Ubuntu; reduces friction
4. **Security Hardened**: AppArmor, seccomp defaults, UFW ready
5. **Netplan Integration**: Declarative networking matches ClaudeOS philosophy
6. **Hardware Support**: Excellent VMware, cloud, and bare-metal drivers

### Size Trade-off Analysis

While Ubuntu is larger than Alpine, the trade-off is acceptable:

```
Alpine Final:  ~80MB   → Requires musl testing, OpenRC translation
Ubuntu Final: ~450MB   → Zero compatibility issues, production-ready

Modern Considerations:
• Smallest AWS EBS: 1GB (both fit easily)
• Network transfer: ~450MB is <60 seconds on 100Mbps
• Storage is cheap; debugging time is expensive
```

---

## Ubuntu Minimal Installation Method

### Using Ubuntu Cloud Image (Recommended)

Ubuntu provides official minimal cloud images that are perfect for custom distributions:

```bash
# Download Ubuntu 24.04 LTS cloud image (minimal ~280MB)
UBUNTU_VERSION="24.04"
IMAGE_URL="https://cloud-images.ubuntu.com/minimal/releases/${UBUNTU_VERSION}/release"
IMAGE_NAME="ubuntu-${UBUNTU_VERSION}-minimal-cloudimg-amd64.img"

wget "${IMAGE_URL}/${IMAGE_NAME}"
```

### Using Debootstrap (Maximum Control)

For absolute minimal builds:

```bash
# Create minimal Ubuntu rootfs via debootstrap
debootstrap --variant=minbase \
  --include=systemd,systemd-sysv,dbus,netplan.io,openssh-server,ca-certificates \
  noble /mnt/rootfs http://archive.ubuntu.com/ubuntu
```

### Recommended Package Set

```yaml
# Ubuntu minimal packages for ClaudeOS
essential:
  - systemd                  # Init system (native)
  - systemd-sysv             # SysV compatibility
  - dbus                     # IPC bus
  - ca-certificates          # TLS trust store
  - gnupg                    # Key management

networking:
  - netplan.io               # Declarative network config
  - iproute2                 # ip command
  - iptables                 # Firewall (legacy mode)
  - nftables                 # Modern firewall
  - openssh-server           # Remote access
  - curl                     # API connectivity test

container_runtime:
  - containerd               # Container runtime
  - runc                     # OCI runtime
  - containernetworking-plugins  # CNI plugins

utilities:
  - vim-tiny                 # Editor (optional)
  - less                     # Pager
  - jq                       # JSON processing

cloud:
  - cloud-init               # First-boot config
  - open-vm-tools            # VMware integration

claudeos:  # From Phase 2 build
  - claude-agent
  - claude-reconciler
  - claude-observe
  - claude
  - claude-validator
```

---

## Kernel Configuration

Ubuntu provides well-configured kernels out of the box. No custom compilation needed.

### Kernel Selection

```bash
# Use Ubuntu's kernel packages
# GA Kernel (General Availability) - Default
apt install linux-image-generic

# OR HWE Kernel (Hardware Enablement) - Newer hardware
apt install linux-image-generic-hwe-24.04

# Kernel versions in 24.04:
# GA:  6.8.x (at release)
# HWE: 6.11.x (rolling updates)
```

### Required Kernel Features (Pre-enabled in Ubuntu)

```
All required features are enabled in Ubuntu's default kernel:
✓ cgroup v2 support          (default in 24.04)
✓ namespaces (all types)     (enabled)
✓ overlayfs                  (module)
✓ seccomp                    (enabled)
✓ netfilter/nftables         (modules)
✓ bridge, veth, vxlan        (modules)
✓ ext4, squashfs, overlayfs  (modules)
✓ device mapper              (module)
✓ VMware drivers             (vmxnet3, pvscsi, vmw_balloon)
✓ AppArmor LSM               (enabled, default)
```

### Verify Container Requirements

```bash
# Ubuntu includes a verification script
/usr/share/doc/containerd/contrib/check-config.sh

# All checks should pass for ClaudeOS requirements
```

---

## Root Filesystem Layout

```
/ (root) - Ubuntu 24.04 LTS
├── bin -> usr/bin              # UsrMerge (Ubuntu standard)
├── sbin -> usr/sbin
├── lib -> usr/lib
├── lib64 -> usr/lib64
│
├── usr/
│   ├── bin/
│   │   ├── claude-agent        # ClaudeOS binaries
│   │   ├── claude-reconciler
│   │   ├── claude-observe
│   │   ├── claude
│   │   └── claude-validator
│   ├── lib/
│   │   └── systemd/
│   │       └── system/         # Vendor service files
│   └── share/
│       └── claude/
│           └── schemas/        # JSON schemas
│
├── etc/
│   ├── claude.d/               # ClaudeOS state directory
│   │   ├── manifest.yaml       # System manifest
│   │   ├── services.yaml       # Container services
│   │   ├── network.yaml        # Network config (syncs to netplan)
│   │   ├── storage.yaml        # Volume definitions
│   │   ├── security.yaml       # Firewall rules (syncs to nftables)
│   │   └── scheduled.yaml      # Cron-like tasks
│   │
│   ├── systemd/
│   │   └── system/
│   │       ├── claude-agent.service
│   │       ├── claude-reconciler.service
│   │       ├── claude-observe.service
│   │       └── claude.target    # ClaudeOS target unit
│   │
│   ├── netplan/
│   │   └── 50-claude-network.yaml  # Generated by reconciler
│   │
│   ├── containerd/
│   │   └── config.toml
│   │
│   ├── ssh/
│   │   └── sshd_config.d/
│   │       └── claude.conf      # ClaudeOS SSH hardening
│   │
│   ├── apparmor.d/
│   │   └── claude/              # AppArmor profiles
│   │       ├── claude-agent
│   │       ├── claude-reconciler
│   │       └── claude-observe
│   │
│   ├── cloud/
│   │   └── cloud.cfg.d/
│   │       └── 99-claude.cfg    # cloud-init customization
│   │
│   ├── hostname
│   ├── hosts
│   └── machine-id
│
├── var/
│   ├── lib/
│   │   ├── claude/             # ClaudeOS persistent data
│   │   │   ├── snapshots/      # State snapshots
│   │   │   └── git/            # Git repository for state
│   │   └── containerd/         # Container storage
│   │
│   ├── log/
│   │   └── journal/            # systemd journal (persistent)
│   │
│   └── run -> /run
│
├── run/                        # tmpfs
│   ├── containerd/
│   └── claude/
│
├── tmp/                        # tmpfs
├── dev/                        # devtmpfs
├── proc/                       # procfs
└── sys/                        # sysfs
```

---

## Systemd Integration

### Service Dependency Graph

```
                        ┌─────────────────┐
                        │  multi-user.target│
                        └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │  claude.target  │
                        └────────┬────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  claude-agent   │   │claude-reconciler│   │  claude-observe │
│    .service     │   │    .service     │   │    .service     │
└────────┬────────┘   └────────┬────────┘   └────────┬────────┘
         │                     │                     │
         └──────────┬──────────┴──────────┬──────────┘
                    │                     │
           ┌────────▼────────┐   ┌────────▼────────┐
           │  containerd     │   │    network      │
           │    .service     │   │    .target      │
           └─────────────────┘   └─────────────────┘
```

### Claude Target Unit

```ini
# /etc/systemd/system/claude.target
[Unit]
Description=ClaudeOS Services Target
Documentation=https://github.com/anthropics/claude-os
Requires=containerd.service network-online.target
After=containerd.service network-online.target
Wants=claude-agent.service claude-reconciler.service claude-observe.service

[Install]
WantedBy=multi-user.target
```

### Service Units (Ubuntu-Optimized)

```ini
# /etc/systemd/system/claude-agent.service
[Unit]
Description=ClaudeOS Agent - Natural Language System Administration
Documentation=man:claude-agent(8)
After=network-online.target containerd.service
Wants=network-online.target
PartOf=claude.target

[Service]
Type=notify
ExecStart=/usr/bin/claude-agent
Restart=on-failure
RestartSec=5
WatchdogSec=30

# Security hardening (Ubuntu-specific)
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes
NoNewPrivileges=yes
ReadWritePaths=/etc/claude.d /var/lib/claude /run/claude
AmbientCapabilities=CAP_NET_ADMIN CAP_SYS_ADMIN

# Resource limits
MemoryMax=512M
CPUQuota=50%

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=claude-agent

[Install]
WantedBy=claude.target
```

```ini
# /etc/systemd/system/claude-reconciler.service
[Unit]
Description=ClaudeOS Reconciler - Declarative State Management
Documentation=man:claude-reconciler(8)
After=containerd.service claude-agent.service
Requires=containerd.service
PartOf=claude.target

[Service]
Type=notify
ExecStart=/usr/bin/claude-reconciler
Restart=on-failure
RestartSec=5
WatchdogSec=60

# Needs broader access for system modifications
ProtectSystem=no
PrivateTmp=yes
NoNewPrivileges=no
AmbientCapabilities=CAP_NET_ADMIN CAP_SYS_ADMIN CAP_CHOWN CAP_DAC_OVERRIDE

# State directory access
ReadWritePaths=/etc/claude.d /var/lib/claude /var/lib/containerd /run/containerd
ReadOnlyPaths=/usr/share/claude/schemas

# Reconciler needs full CPU during convergence
CPUQuota=100%

[Install]
WantedBy=claude.target
```

---

## Build Pipeline (Ubuntu Edition)

### Directory Structure

```
build/
├── Makefile                     # Main build orchestration
├── Dockerfile.build             # Build environment
├── scripts/
│   ├── 01-prepare-base.sh       # Get Ubuntu cloud image
│   ├── 02-customize-rootfs.sh   # Install packages, configure
│   ├── 03-install-claudeos.sh   # Copy binaries, schemas
│   ├── 04-configure-systemd.sh  # Enable services
│   ├── 05-security-harden.sh    # AppArmor, SSH, etc.
│   ├── 06-create-image.sh       # Build raw image
│   ├── 07-convert-vmdk.sh       # VMware conversion
│   └── 08-create-ova.sh         # OVA packaging
├── configs/
│   ├── containerd.toml          # containerd configuration
│   ├── netplan-default.yaml     # Default network config
│   ├── cloud-init-claude.cfg    # First-boot config
│   ├── sshd-claude.conf         # SSH hardening
│   ├── apparmor/                # AppArmor profiles
│   │   ├── claude-agent
│   │   ├── claude-reconciler
│   │   └── claude-observe
│   └── motd                     # Welcome message
├── overlays/                    # Files to copy into rootfs
│   ├── etc/
│   └── usr/
├── templates/
│   ├── claudeos.vmx             # VMware config
│   └── claudeos.ovf             # OVF template
└── output/
    ├── rootfs/                  # Built filesystem
    └── images/
        ├── claudeos-ubuntu.raw
        ├── claudeos-ubuntu.vmdk
        └── claudeos-ubuntu.ova
```

### Build Environment

```dockerfile
# Dockerfile.build
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    debootstrap \
    qemu-utils \
    parted \
    e2fsprogs \
    dosfstools \
    grub-pc-bin \
    grub-efi-amd64-bin \
    gdisk \
    xorriso \
    squashfs-tools \
    wget \
    curl \
    git \
    make \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build
COPY . /build/

ENTRYPOINT ["/bin/bash"]
```

### Main Build Script

```bash
#!/bin/bash
# scripts/01-prepare-base.sh
set -euo pipefail

UBUNTU_VERSION="24.04"
WORK_DIR="${WORK_DIR:-/build/output}"
ROOTFS_DIR="${WORK_DIR}/rootfs"

echo "=== Preparing Ubuntu ${UBUNTU_VERSION} base ==="

mkdir -p "${ROOTFS_DIR}"

# Option 1: Debootstrap (smaller, more control)
if [[ "${BUILD_METHOD:-debootstrap}" == "debootstrap" ]]; then
    echo "Using debootstrap for minimal install..."
    
    debootstrap --variant=minbase \
        --include=systemd,systemd-sysv,dbus,ca-certificates,apt-transport-https \
        noble "${ROOTFS_DIR}" http://archive.ubuntu.com/ubuntu
    
    # Add universe repository for containerd
    cat > "${ROOTFS_DIR}/etc/apt/sources.list" << 'EOF'
deb http://archive.ubuntu.com/ubuntu noble main restricted universe
deb http://archive.ubuntu.com/ubuntu noble-updates main restricted universe
deb http://archive.ubuntu.com/ubuntu noble-security main restricted universe
EOF

# Option 2: Cloud image (faster, pre-configured)
elif [[ "${BUILD_METHOD}" == "cloud-image" ]]; then
    echo "Using Ubuntu cloud image..."
    
    IMAGE_URL="https://cloud-images.ubuntu.com/minimal/releases/${UBUNTU_VERSION}/release"
    IMAGE_NAME="ubuntu-${UBUNTU_VERSION}-minimal-cloudimg-amd64.img"
    
    wget -O "${WORK_DIR}/base.img" "${IMAGE_URL}/${IMAGE_NAME}"
    
    # Mount and extract
    mkdir -p "${WORK_DIR}/mnt"
    # ... extraction logic
fi

echo "=== Base preparation complete ==="
```

```bash
#!/bin/bash
# scripts/02-customize-rootfs.sh
set -euo pipefail

ROOTFS_DIR="${WORK_DIR:-/build/output}/rootfs"

echo "=== Installing packages ==="

# Mount necessary filesystems for chroot
mount --bind /dev "${ROOTFS_DIR}/dev"
mount --bind /dev/pts "${ROOTFS_DIR}/dev/pts"
mount -t proc proc "${ROOTFS_DIR}/proc"
mount -t sysfs sysfs "${ROOTFS_DIR}/sys"

# Configure DNS for chroot
cp /etc/resolv.conf "${ROOTFS_DIR}/etc/resolv.conf"

# Install packages in chroot
chroot "${ROOTFS_DIR}" /bin/bash << 'CHROOT_EOF'
export DEBIAN_FRONTEND=noninteractive

apt-get update

# Core packages
apt-get install -y --no-install-recommends \
    linux-image-generic \
    systemd-sysv \
    dbus \
    ca-certificates \
    gnupg \
    netplan.io \
    iproute2 \
    iptables \
    nftables \
    openssh-server \
    curl \
    containerd \
    runc \
    containernetworking-plugins \
    cloud-init \
    open-vm-tools \
    apparmor \
    apparmor-utils \
    jq \
    git

# Clean up
apt-get clean
rm -rf /var/lib/apt/lists/*
rm -rf /var/cache/apt/archives/*
rm -rf /usr/share/doc/*
rm -rf /usr/share/man/*
rm -rf /usr/share/locale/*

CHROOT_EOF

# Unmount
umount "${ROOTFS_DIR}/sys"
umount "${ROOTFS_DIR}/proc"
umount "${ROOTFS_DIR}/dev/pts"
umount "${ROOTFS_DIR}/dev"

echo "=== Package installation complete ==="
```

```bash
#!/bin/bash
# scripts/03-install-claudeos.sh
set -euo pipefail

ROOTFS_DIR="${WORK_DIR:-/build/output}/rootfs"
CLAUDEOS_BUILD="${CLAUDEOS_BUILD:-/build/claudeos}"

echo "=== Installing ClaudeOS binaries ==="

# Copy binaries
install -m 755 "${CLAUDEOS_BUILD}/bin/claude-agent" "${ROOTFS_DIR}/usr/bin/"
install -m 755 "${CLAUDEOS_BUILD}/bin/claude-reconciler" "${ROOTFS_DIR}/usr/bin/"
install -m 755 "${CLAUDEOS_BUILD}/bin/claude-observe" "${ROOTFS_DIR}/usr/bin/"
install -m 755 "${CLAUDEOS_BUILD}/bin/claude" "${ROOTFS_DIR}/usr/bin/"
install -m 755 "${CLAUDEOS_BUILD}/bin/claude-validator" "${ROOTFS_DIR}/usr/bin/"

# Copy schemas
mkdir -p "${ROOTFS_DIR}/usr/share/claude/schemas"
cp -r "${CLAUDEOS_BUILD}/schemas/"* "${ROOTFS_DIR}/usr/share/claude/schemas/"

# Create state directory structure
mkdir -p "${ROOTFS_DIR}/etc/claude.d"
mkdir -p "${ROOTFS_DIR}/var/lib/claude/snapshots"
mkdir -p "${ROOTFS_DIR}/var/lib/claude/git"

# Initialize default state files
cat > "${ROOTFS_DIR}/etc/claude.d/manifest.yaml" << 'EOF'
version: "1.0"
hostname: claudeos
timezone: UTC
locale: en_US.UTF-8
EOF

cat > "${ROOTFS_DIR}/etc/claude.d/services.yaml" << 'EOF'
version: "1.0"
services: {}
EOF

cat > "${ROOTFS_DIR}/etc/claude.d/network.yaml" << 'EOF'
version: "1.0"
interfaces:
  eth0:
    mode: dhcp
EOF

cat > "${ROOTFS_DIR}/etc/claude.d/security.yaml" << 'EOF'
version: "1.0"
firewall:
  default_policy: drop
  rules:
    - name: allow-ssh
      port: 22
      protocol: tcp
      source: any
      action: accept
    - name: allow-established
      state: established,related
      action: accept
EOF

echo "=== ClaudeOS installation complete ==="
```

```bash
#!/bin/bash
# scripts/04-configure-systemd.sh
set -euo pipefail

ROOTFS_DIR="${WORK_DIR:-/build/output}/rootfs"

echo "=== Configuring systemd services ==="

# Copy service files
cp configs/systemd/* "${ROOTFS_DIR}/etc/systemd/system/"

# Enable services in chroot
chroot "${ROOTFS_DIR}" /bin/bash << 'CHROOT_EOF'
systemctl enable containerd.service
systemctl enable ssh.service
systemctl enable cloud-init.service
systemctl enable claude.target
systemctl enable claude-agent.service
systemctl enable claude-reconciler.service
systemctl enable claude-observe.service

# Set default target
systemctl set-default multi-user.target
CHROOT_EOF

echo "=== Systemd configuration complete ==="
```

### Makefile

```makefile
# build/Makefile
.PHONY: all clean image vmdk ova test

WORK_DIR := $(PWD)/output
ROOTFS_DIR := $(WORK_DIR)/rootfs
CLAUDEOS_BUILD := $(PWD)/../claudeos

export WORK_DIR ROOTFS_DIR CLAUDEOS_BUILD

all: vmdk

# Build environment
build-env:
	docker build -t claudeos-builder -f Dockerfile.build .

# Individual steps
base:
	./scripts/01-prepare-base.sh

packages: base
	./scripts/02-customize-rootfs.sh

claudeos: packages
	./scripts/03-install-claudeos.sh

systemd: claudeos
	./scripts/04-configure-systemd.sh

security: systemd
	./scripts/05-security-harden.sh

# Image creation
image: security
	./scripts/06-create-image.sh

vmdk: image
	./scripts/07-convert-vmdk.sh

ova: vmdk
	./scripts/08-create-ova.sh

# Testing
test-qemu: image
	qemu-system-x86_64 \
		-hda $(WORK_DIR)/images/claudeos-ubuntu.raw \
		-m 2G \
		-smp 2 \
		-enable-kvm \
		-netdev user,id=net0,hostfwd=tcp::2222-:22 \
		-device virtio-net,netdev=net0

# Docker-based build
docker-build: build-env
	docker run --rm --privileged \
		-v $(PWD):/build \
		-v $(CLAUDEOS_BUILD):/build/claudeos \
		claudeos-builder make vmdk

clean:
	rm -rf $(WORK_DIR)
```

---

## First-Boot Configuration

### Cloud-Init Integration

```yaml
# configs/cloud-init-claude.cfg
#cloud-config

# Disable modules we don't need
cloud_config_modules:
  - runcmd
  - scripts-user

cloud_final_modules:
  - final-message

# System configuration
system_info:
  default_user:
    name: claude
    lock_passwd: false
    gecos: ClaudeOS Administrator
    groups: [adm, sudo, systemd-journal]
    sudo: ["ALL=(ALL) NOPASSWD:ALL"]
    shell: /bin/bash

# Hostname
preserve_hostname: false
hostname: claudeos

# Network (defer to netplan)
network:
  config: disabled

# Package updates on first boot
package_update: true
package_upgrade: true

# Final message
final_message: |
  
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   ██████╗██╗      █████╗ ██╗   ██╗██████╗ ███████╗       ║
  ║  ██╔════╝██║     ██╔══██╗██║   ██║██╔══██╗██╔════╝       ║
  ║  ██║     ██║     ███████║██║   ██║██║  ██║█████╗         ║
  ║  ██║     ██║     ██╔══██║██║   ██║██║  ██║██╔══╝         ║
  ║  ╚██████╗███████╗██║  ██║╚██████╔╝██████╔╝███████╗       ║
  ║   ╚═════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝.OS    ║
  ║                                                           ║
  ║   The LLM-Native Operating System                         ║
  ║   Ubuntu 24.04 LTS Edition                                ║
  ║                                                           ║
  ║   Get started: claude "show me what you can do"           ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  
  System boot completed in $UPTIME seconds.
```

### Default Netplan Configuration

```yaml
# configs/netplan-default.yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    eth0:
      dhcp4: true
      dhcp6: true
      optional: true
    # VMware network adapters
    ens*:
      dhcp4: true
      dhcp6: true
      optional: true
```

---

## Security Hardening

### AppArmor Profile for claude-agent

```
# configs/apparmor/claude-agent
#include <tunables/global>

profile claude-agent /usr/bin/claude-agent {
  #include <abstractions/base>
  #include <abstractions/nameservice>
  #include <abstractions/ssl_certs>
  
  # Binary
  /usr/bin/claude-agent mr,
  
  # Configuration
  /etc/claude.d/ r,
  /etc/claude.d/** rw,
  
  # Data directory
  /var/lib/claude/ r,
  /var/lib/claude/** rw,
  
  # Runtime
  /run/claude/ rw,
  /run/claude/** rw,
  
  # Schemas (read-only)
  /usr/share/claude/schemas/ r,
  /usr/share/claude/schemas/** r,
  
  # Network access (for API calls)
  network inet stream,
  network inet6 stream,
  
  # Deny sensitive paths
  deny /etc/shadow r,
  deny /etc/gshadow r,
  deny /home/** rw,
  deny /root/** rw,
}
```

### SSH Hardening

```
# configs/sshd-claude.conf
# ClaudeOS SSH Hardening Configuration

# Authentication
PermitRootLogin prohibit-password
PasswordAuthentication no
PubkeyAuthentication yes
AuthenticationMethods publickey

# Security
X11Forwarding no
AllowTcpForwarding no
AllowAgentForwarding no
PermitTunnel no

# Session
ClientAliveInterval 300
ClientAliveCountMax 2
MaxAuthTries 3
MaxSessions 5

# Logging
LogLevel VERBOSE

# Allow claude user
AllowUsers claude
```

---

## VMware Configuration

### VMX Template

```
# templates/claudeos.vmx
.encoding = "UTF-8"
config.version = "8"
virtualHW.version = "19"

# General
displayName = "ClaudeOS Ubuntu 24.04"
guestOS = "ubuntu-64"
annotation = "ClaudeOS - The LLM-Native Operating System (Ubuntu Edition)"

# Hardware
memsize = "2048"
numvcpus = "2"
cpuid.coresPerSocket = "2"

# Storage
scsi0.virtualDev = "pvscsi"
scsi0.present = "TRUE"
scsi0:0.fileName = "claudeos-ubuntu.vmdk"
scsi0:0.present = "TRUE"

# Network
ethernet0.virtualDev = "vmxnet3"
ethernet0.networkName = "VM Network"
ethernet0.addressType = "generated"
ethernet0.present = "TRUE"

# VMware Tools
tools.syncTime = "TRUE"
tools.upgrade.policy = "manual"

# Boot
firmware = "efi"
bios.bootOrder = "hdd"

# Other
floppy0.present = "FALSE"
vmci0.present = "TRUE"
hpet0.present = "TRUE"
```

### OVF Template (excerpt)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Envelope xmlns="http://schemas.dmtf.org/ovf/envelope/1"
          xmlns:vssd="http://schemas.dmtf.org/wbem/wscim/1/cim-schema/2/CIM_VirtualSystemSettingData"
          xmlns:rasd="http://schemas.dmtf.org/wbem/wscim/1/cim-schema/2/CIM_ResourceAllocationSettingData">
  
  <References>
    <File ovf:href="claudeos-ubuntu.vmdk" ovf:id="file1"/>
  </References>
  
  <DiskSection>
    <Info>Virtual disk information</Info>
    <Disk ovf:capacity="10737418240" ovf:diskId="vmdisk1" 
          ovf:fileRef="file1" ovf:format="http://www.vmware.com/interfaces/specifications/vmdk.html#streamOptimized"/>
  </DiskSection>
  
  <VirtualSystem ovf:id="ClaudeOS">
    <Info>ClaudeOS - LLM-Native Operating System</Info>
    <Name>ClaudeOS Ubuntu 24.04</Name>
    
    <ProductSection>
      <Info>Product information</Info>
      <Product>ClaudeOS</Product>
      <Vendor>Anthropic</Vendor>
      <Version>1.0</Version>
      <FullVersion>1.0.0-ubuntu2404</FullVersion>
    </ProductSection>
    
    <OperatingSystemSection ovf:id="101">
      <Info>Guest Operating System</Info>
      <Description>Ubuntu 24.04 LTS (64-bit)</Description>
    </OperatingSystemSection>
    
    <VirtualHardwareSection>
      <Info>Virtual hardware requirements</Info>
      <!-- CPU, Memory, Disk, Network definitions -->
    </VirtualHardwareSection>
  </VirtualSystem>
</Envelope>
```

---

## Implementation Timeline

### Phase 3.1: Ubuntu Foundation (Week 1)

| Task | Description | Priority |
|------|-------------|----------|
| Build environment setup | Docker container with Ubuntu tools | High |
| Base image creation | Debootstrap or cloud image extraction | High |
| Package installation | Minimal package set | High |
| ClaudeOS integration | Copy binaries, schemas, configs | High |

**Deliverables:**
- Working build container
- Ubuntu rootfs with ClaudeOS binaries
- Initial boot test (QEMU)

### Phase 3.2: Systemd & Services (Week 2)

| Task | Description | Priority |
|------|-------------|----------|
| Service units | Configure all ClaudeOS services | High |
| Service dependencies | Proper startup ordering | High |
| containerd setup | Runtime configuration | High |
| Network configuration | Netplan + cloud-init | Medium |

**Deliverables:**
- All services starting correctly
- containerd operational
- Network connectivity

### Phase 3.3: Security & Polish (Week 3)

| Task | Description | Priority |
|------|-------------|----------|
| AppArmor profiles | Confine ClaudeOS services | High |
| SSH hardening | Secure remote access | High |
| First-boot wizard | cloud-init customization | Medium |
| Image optimization | Reduce size, remove cruft | Medium |

**Deliverables:**
- Security-hardened image
- Clean first-boot experience
- Optimized image size

### Phase 3.4: VMware & Release (Week 4)

| Task | Description | Priority |
|------|-------------|----------|
| VMDK conversion | Create VMware disk | High |
| VMware testing | Test on Workstation/Fusion/ESXi | High |
| OVA packaging | Create importable package | Medium |
| Documentation | User guide, release notes | High |

**Deliverables:**
- VMware-compatible VMDK
- OVA package
- Complete documentation

---

## Technical Specifications

### VM Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 1 vCPU | 2 vCPU |
| RAM | 1 GB | 2-4 GB |
| Disk | 4 GB | 20 GB |
| Network | NAT | Bridged |

### Image Size Targets

| Component | Estimated Size |
|-----------|----------------|
| Kernel + modules | 80-100 MB |
| Ubuntu minimal base | 200-250 MB |
| containerd + runc | 50-60 MB |
| ClaudeOS binaries | 40-50 MB |
| Schemas + configs | 5 MB |
| **Total uncompressed** | **~400-450 MB** |
| **Total compressed** | **~200-250 MB** |

---

## Testing Strategy

### Boot Tests

```bash
# QEMU boot test
qemu-system-x86_64 \
  -hda output/images/claudeos-ubuntu.raw \
  -m 2G -smp 2 \
  -enable-kvm \
  -netdev user,id=net0,hostfwd=tcp::2222-:22 \
  -device virtio-net,netdev=net0

# SSH in after boot
ssh -p 2222 claude@localhost
```

### Service Tests

```bash
# Verify all services
systemctl status claude.target
systemctl status claude-agent
systemctl status claude-reconciler
systemctl status claude-observe
systemctl status containerd

# Test CLI
claude status
claude "what services are running?"

# Test container runtime
ctr images pull docker.io/library/alpine:latest
ctr run --rm docker.io/library/alpine:latest test echo "Hello ClaudeOS"
```

### Integration Tests

```bash
# Test full workflow
claude "create a web server using nginx"
# Verify container runs
curl http://localhost:80

# Test state persistence
reboot
# After reboot, verify nginx is still running
curl http://localhost:80
```

---

## Success Criteria

### MVP Requirements

- [ ] Image boots in VMware Workstation/Fusion
- [ ] Ubuntu 24.04 LTS kernel and userspace
- [ ] All 5 ClaudeOS binaries present and executable
- [ ] claude-agent responds to natural language commands
- [ ] containerd can pull and run containers
- [ ] SSH access functional
- [ ] State files persist across reboot

### Full Release Criteria

- [ ] Image size < 500MB compressed
- [ ] Boot time < 30 seconds
- [ ] Works in VMware Workstation, Fusion, ESXi
- [ ] Works in QEMU/KVM
- [ ] OVA package for easy import
- [ ] AppArmor profiles active and enforcing
- [ ] Automated CI/CD build pipeline
- [ ] Complete documentation

---

## References

- [Ubuntu Cloud Images](https://cloud-images.ubuntu.com/)
- [Ubuntu 24.04 Release Notes](https://wiki.ubuntu.com/NobleNumbat/ReleaseNotes)
- [Debootstrap Manual](https://wiki.debian.org/Debootstrap)
- [containerd Documentation](https://containerd.io/docs/)
- [Netplan Documentation](https://netplan.io/reference)
- [AppArmor Wiki](https://wiki.ubuntu.com/AppArmor)
- [VMware Virtual Disk Format](https://www.vmware.com/app/vmdk/)
- [cloud-init Documentation](https://cloudinit.readthedocs.io/)

---

*ClaudeOS Bootable Image - Ubuntu 24.04 LTS Edition*
*Document Version 2.0 - Phase 3 Implementation Plan*
