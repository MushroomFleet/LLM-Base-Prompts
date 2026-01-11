# LOAF Successor: Complete Implementation Plan

## Project: MicroLinux — A Modern 1.44MB Bootable Linux

This document provides every file, configuration, and command needed to build a fully functional Linux system that fits on a 1.44MB floppy disk (or floppy-sized image).

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Prerequisites & Environment Setup](#2-prerequisites--environment-setup)
3. [Master Build Script](#3-master-build-script)
4. [Kernel Configuration](#4-kernel-configuration)
5. [BusyBox Configuration](#5-busybox-configuration)
6. [musl libc Cross-Compiler](#6-musl-libc-cross-compiler)
7. [Init System](#7-init-system)
8. [Root Filesystem Assembly](#8-root-filesystem-assembly)
9. [Bootloader Integration](#9-bootloader-integration)
10. [Final Image Creation](#10-final-image-creation)
11. [Testing & Debugging](#11-testing--debugging)
12. [Size Optimization Techniques](#12-size-optimization-techniques)
13. [Troubleshooting Guide](#13-troubleshooting-guide)

---

## 1. Project Structure

```
microlinux/
├── build.sh                 # Master build script
├── clean.sh                 # Cleanup script
├── config/
│   ├── kernel.config        # Linux kernel configuration
│   └── busybox.config       # BusyBox configuration
├── scripts/
│   ├── 01-setup-toolchain.sh
│   ├── 02-build-kernel.sh
│   ├── 03-build-busybox.sh
│   ├── 04-create-rootfs.sh
│   ├── 05-create-initramfs.sh
│   └── 06-create-floppy.sh
├── rootfs/
│   ├── init                 # PID 1 init script
│   ├── etc/
│   │   ├── inittab
│   │   ├── passwd
│   │   ├── group
│   │   ├── profile
│   │   └── issue
│   └── ... (generated)
├── src/                     # Downloaded sources (generated)
├── build/                   # Build artifacts (generated)
└── output/
    └── floppy.img           # Final bootable image
```

---

## 2. Prerequisites & Environment Setup

### 2.1 Host System Requirements

```bash
# Debian/Ubuntu
sudo apt update
sudo apt install -y \
    build-essential \
    gcc \
    g++ \
    make \
    bison \
    flex \
    libelf-dev \
    libssl-dev \
    bc \
    cpio \
    xz-utils \
    zstd \
    syslinux \
    syslinux-utils \
    dosfstools \
    mtools \
    qemu-system-x86 \
    wget \
    git \
    ncurses-dev \
    perl

# Fedora/RHEL
sudo dnf install -y \
    @development-tools \
    gcc \
    gcc-c++ \
    make \
    bison \
    flex \
    elfutils-libelf-devel \
    openssl-devel \
    bc \
    cpio \
    xz \
    zstd \
    syslinux \
    dosfstools \
    mtools \
    qemu-system-x86 \
    wget \
    git \
    ncurses-devel \
    perl

# Arch Linux
sudo pacman -S --needed \
    base-devel \
    bc \
    cpio \
    xz \
    zstd \
    syslinux \
    dosfstools \
    mtools \
    qemu \
    wget \
    git \
    ncurses \
    perl \
    libelf \
    openssl
```

### 2.2 Project Initialization Script

```bash
#!/bin/bash
# File: init-project.sh
# Initialize the MicroLinux project structure

set -e

PROJECT_ROOT="$(pwd)/microlinux"

mkdir -p "$PROJECT_ROOT"/{config,scripts,rootfs/etc,src,build,output}

echo "MicroLinux project initialized at $PROJECT_ROOT"
echo "Next: Copy configuration files and run build.sh"
```

---

## 3. Master Build Script

```bash
#!/bin/bash
# File: build.sh
# Master build script for MicroLinux

set -e
set -o pipefail

#=============================================================================
# Configuration
#=============================================================================

export PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
export SRC_DIR="$PROJECT_ROOT/src"
export BUILD_DIR="$PROJECT_ROOT/build"
export OUTPUT_DIR="$PROJECT_ROOT/output"
export CONFIG_DIR="$PROJECT_ROOT/config"
export ROOTFS_TEMPLATE="$PROJECT_ROOT/rootfs"

# Version pinning for reproducibility
export KERNEL_VERSION="6.6.70"
export KERNEL_MAJOR="6.x"
export BUSYBOX_VERSION="1.36.1"

# Target architecture
export ARCH="x86"
export CROSS_COMPILE=""  # Native compile for simplicity

# Parallel jobs
export JOBS=$(nproc)

# Size target (bytes) - 1.44MB floppy = 1474560 bytes
export TARGET_SIZE=1474560

#=============================================================================
# Color Output
#=============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

#=============================================================================
# Helper Functions
#=============================================================================

check_size() {
    local file="$1"
    local size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    local percent=$((size * 100 / TARGET_SIZE))
    
    if [ "$size" -gt "$TARGET_SIZE" ]; then
        log_error "$file is $size bytes ($percent% of floppy) - TOO LARGE!"
        log_error "Exceeds limit by $((size - TARGET_SIZE)) bytes"
        return 1
    else
        log_ok "$file is $size bytes ($percent% of floppy capacity)"
        log_info "Remaining space: $((TARGET_SIZE - size)) bytes"
        return 0
    fi
}

download_source() {
    local url="$1"
    local dest="$2"
    
    if [ -f "$dest" ]; then
        log_info "Source already downloaded: $dest"
    else
        log_info "Downloading: $url"
        wget -q --show-progress -O "$dest" "$url"
    fi
}

#=============================================================================
# Build Stages
#=============================================================================

stage_download() {
    log_info "=== Stage 1: Downloading Sources ==="
    
    mkdir -p "$SRC_DIR"
    
    # Linux Kernel
    local kernel_url="https://cdn.kernel.org/pub/linux/kernel/v${KERNEL_MAJOR}/linux-${KERNEL_VERSION}.tar.xz"
    download_source "$kernel_url" "$SRC_DIR/linux-${KERNEL_VERSION}.tar.xz"
    
    # BusyBox
    local busybox_url="https://busybox.net/downloads/busybox-${BUSYBOX_VERSION}.tar.bz2"
    download_source "$busybox_url" "$SRC_DIR/busybox-${BUSYBOX_VERSION}.tar.bz2"
    
    log_ok "All sources downloaded"
}

stage_extract() {
    log_info "=== Stage 2: Extracting Sources ==="
    
    mkdir -p "$BUILD_DIR"
    
    # Extract kernel
    if [ ! -d "$BUILD_DIR/linux-${KERNEL_VERSION}" ]; then
        log_info "Extracting Linux kernel..."
        tar -xf "$SRC_DIR/linux-${KERNEL_VERSION}.tar.xz" -C "$BUILD_DIR"
    fi
    
    # Extract BusyBox
    if [ ! -d "$BUILD_DIR/busybox-${BUSYBOX_VERSION}" ]; then
        log_info "Extracting BusyBox..."
        tar -xf "$SRC_DIR/busybox-${BUSYBOX_VERSION}.tar.bz2" -C "$BUILD_DIR"
    fi
    
    log_ok "Sources extracted"
}

stage_build_kernel() {
    log_info "=== Stage 3: Building Kernel ==="
    
    local kernel_dir="$BUILD_DIR/linux-${KERNEL_VERSION}"
    
    cd "$kernel_dir"
    
    # Start from tinyconfig for absolute minimum
    make tinyconfig
    
    # Apply our custom config on top
    if [ -f "$CONFIG_DIR/kernel.config" ]; then
        log_info "Merging custom kernel config..."
        scripts/kconfig/merge_config.sh -m .config "$CONFIG_DIR/kernel.config"
    fi
    
    # Ensure config is valid
    make olddefconfig
    
    # Build kernel
    log_info "Compiling kernel (this takes a few minutes)..."
    make -j"$JOBS" bzImage
    
    # Copy kernel
    mkdir -p "$OUTPUT_DIR"
    cp arch/x86/boot/bzImage "$OUTPUT_DIR/vmlinuz"
    
    local kernel_size=$(stat -c%s "$OUTPUT_DIR/vmlinuz")
    log_ok "Kernel built: $kernel_size bytes"
    
    cd "$PROJECT_ROOT"
}

stage_build_busybox() {
    log_info "=== Stage 4: Building BusyBox ==="
    
    local busybox_dir="$BUILD_DIR/busybox-${BUSYBOX_VERSION}"
    
    cd "$busybox_dir"
    
    # Start with default config, then apply our minimal config
    make defconfig
    
    if [ -f "$CONFIG_DIR/busybox.config" ]; then
        log_info "Applying custom BusyBox config..."
        cp "$CONFIG_DIR/busybox.config" .config
        make oldconfig
    fi
    
    # Build statically linked
    make -j"$JOBS"
    
    # Strip symbols
    strip busybox
    
    local busybox_size=$(stat -c%s busybox)
    log_ok "BusyBox built: $busybox_size bytes"
    
    cd "$PROJECT_ROOT"
}

stage_create_rootfs() {
    log_info "=== Stage 5: Creating Root Filesystem ==="
    
    local rootfs="$BUILD_DIR/rootfs"
    local busybox_dir="$BUILD_DIR/busybox-${BUSYBOX_VERSION}"
    
    # Clean and create directory structure
    rm -rf "$rootfs"
    mkdir -p "$rootfs"/{bin,sbin,usr/bin,usr/sbin,etc,proc,sys,dev,tmp,root,var/log}
    
    # Install BusyBox
    cp "$busybox_dir/busybox" "$rootfs/bin/"
    
    # Create BusyBox symlinks
    cd "$rootfs/bin"
    for applet in $("$rootfs/bin/busybox" --list); do
        ln -sf busybox "$applet" 2>/dev/null || true
    done
    cd "$PROJECT_ROOT"
    
    # Create additional symlinks in standard locations
    cd "$rootfs/sbin"
    for cmd in init halt reboot poweroff; do
        ln -sf ../bin/busybox "$cmd" 2>/dev/null || true
    done
    cd "$PROJECT_ROOT"
    
    # Copy init and config files from template
    cp "$ROOTFS_TEMPLATE/init" "$rootfs/init"
    chmod +x "$rootfs/init"
    
    cp -r "$ROOTFS_TEMPLATE/etc/"* "$rootfs/etc/" 2>/dev/null || true
    
    # Create device nodes (will be populated by init)
    # Note: Modern kernels with devtmpfs don't strictly need these
    
    # Create minimal /etc files if not present
    [ -f "$rootfs/etc/passwd" ] || echo "root:x:0:0:root:/root:/bin/sh" > "$rootfs/etc/passwd"
    [ -f "$rootfs/etc/group" ]  || echo "root:x:0:" > "$rootfs/etc/group"
    [ -f "$rootfs/etc/shadow" ] || echo "root::0:0:99999:7:::" > "$rootfs/etc/shadow"
    
    # Calculate rootfs size
    local rootfs_size=$(du -sb "$rootfs" | cut -f1)
    log_ok "Root filesystem created: $rootfs_size bytes (uncompressed)"
}

stage_create_initramfs() {
    log_info "=== Stage 6: Creating Initramfs ==="
    
    local rootfs="$BUILD_DIR/rootfs"
    
    cd "$rootfs"
    
    # Create cpio archive and compress with best compression
    find . -print0 | cpio --null -o -H newc 2>/dev/null | xz -9 --check=crc32 > "$OUTPUT_DIR/initramfs.cpio.xz"
    
    # Also try zstd for comparison
    find . -print0 | cpio --null -o -H newc 2>/dev/null | zstd -19 > "$OUTPUT_DIR/initramfs.cpio.zst"
    
    # Also try gzip for maximum compatibility
    find . -print0 | cpio --null -o -H newc 2>/dev/null | gzip -9 > "$OUTPUT_DIR/initramfs.cpio.gz"
    
    local xz_size=$(stat -c%s "$OUTPUT_DIR/initramfs.cpio.xz")
    local zstd_size=$(stat -c%s "$OUTPUT_DIR/initramfs.cpio.zst")
    local gz_size=$(stat -c%s "$OUTPUT_DIR/initramfs.cpio.gz")
    
    log_info "Initramfs sizes:"
    log_info "  xz:   $xz_size bytes"
    log_info "  zstd: $zstd_size bytes"
    log_info "  gzip: $gz_size bytes"
    
    # Use smallest
    if [ "$xz_size" -le "$zstd_size" ] && [ "$xz_size" -le "$gz_size" ]; then
        cp "$OUTPUT_DIR/initramfs.cpio.xz" "$OUTPUT_DIR/initramfs"
        log_ok "Using xz compression: $xz_size bytes"
    elif [ "$zstd_size" -le "$gz_size" ]; then
        cp "$OUTPUT_DIR/initramfs.cpio.zst" "$OUTPUT_DIR/initramfs"
        log_ok "Using zstd compression: $zstd_size bytes"
    else
        cp "$OUTPUT_DIR/initramfs.cpio.gz" "$OUTPUT_DIR/initramfs"
        log_ok "Using gzip compression: $gz_size bytes"
    fi
    
    cd "$PROJECT_ROOT"
}

stage_create_floppy() {
    log_info "=== Stage 7: Creating Bootable Floppy Image ==="
    
    local floppy="$OUTPUT_DIR/floppy.img"
    local kernel="$OUTPUT_DIR/vmlinuz"
    local initramfs="$OUTPUT_DIR/initramfs"
    
    # Check if kernel supports built-in initramfs (preferred)
    # For now, use syslinux boot method
    
    # Create floppy image
    dd if=/dev/zero of="$floppy" bs=512 count=2880 2>/dev/null
    
    # Create FAT12 filesystem
    mkfs.vfat -F 12 "$floppy"
    
    # Install syslinux bootloader
    syslinux --install "$floppy"
    
    # Copy files using mtools
    # First, configure mtools
    export MTOOLSRC="$BUILD_DIR/mtoolsrc"
    echo "drive a: file=\"$floppy\" partition=1" > "$MTOOLSRC"
    
    # Alternative: use loop mount
    local mnt="$BUILD_DIR/mnt"
    mkdir -p "$mnt"
    
    sudo mount -o loop "$floppy" "$mnt"
    
    # Copy kernel and initramfs
    sudo cp "$kernel" "$mnt/vmlinuz"
    sudo cp "$initramfs" "$mnt/initram"  # 8.3 filename
    
    # Create syslinux config
    sudo tee "$mnt/syslinux.cfg" > /dev/null << 'EOF'
DEFAULT linux
PROMPT 0
TIMEOUT 10

LABEL linux
    KERNEL vmlinuz
    APPEND initrd=initram console=ttyS0,115200 console=tty0
EOF
    
    # Sync and unmount
    sync
    sudo umount "$mnt"
    
    # Final size check
    log_info "=== Final Image Statistics ==="
    check_size "$floppy"
    
    log_ok "Bootable floppy image created: $floppy"
}

#=============================================================================
# Main
#=============================================================================

main() {
    log_info "=========================================="
    log_info "MicroLinux Build System"
    log_info "Target: 1.44MB Bootable Floppy"
    log_info "=========================================="
    
    mkdir -p "$OUTPUT_DIR"
    
    stage_download
    stage_extract
    stage_build_kernel
    stage_build_busybox
    stage_create_rootfs
    stage_create_initramfs
    stage_create_floppy
    
    log_info "=========================================="
    log_ok "Build complete!"
    log_info "=========================================="
    log_info ""
    log_info "Test with:"
    log_info "  qemu-system-i386 -fda $OUTPUT_DIR/floppy.img -nographic"
    log_info ""
    log_info "Or with display:"
    log_info "  qemu-system-i386 -fda $OUTPUT_DIR/floppy.img"
}

# Run if executed directly
if [ "${BASH_SOURCE[0]}" = "$0" ]; then
    main "$@"
fi
```

---

## 4. Kernel Configuration

This configuration starts from `tinyconfig` and adds only essential features:

```bash
# File: config/kernel.config
# MicroLinux Kernel Configuration
# Apply on top of 'make tinyconfig' using merge_config.sh
#
# Philosophy: Enable ONLY what's needed to boot and provide a shell

#=============================================================================
# General Setup - Absolute Minimums
#=============================================================================
CONFIG_LOCALVERSION="-micro"
# CONFIG_LOCALVERSION_AUTO is not set
CONFIG_DEFAULT_HOSTNAME="micro"

# Kernel compression - XZ gives best ratio for small kernels
CONFIG_KERNEL_XZ=y
# CONFIG_KERNEL_GZIP is not set
# CONFIG_KERNEL_BZIP2 is not set
# CONFIG_KERNEL_LZMA is not set
# CONFIG_KERNEL_LZO is not set
# CONFIG_KERNEL_LZ4 is not set
# CONFIG_KERNEL_ZSTD is not set

# Essential process support
CONFIG_MULTIUSER=y
CONFIG_SYSVIPC=y

# Disable expensive features
# CONFIG_AUDITING is not set
# CONFIG_CGROUPS is not set
# CONFIG_NAMESPACES is not set
# CONFIG_CHECKPOINT_RESTORE is not set
# CONFIG_SCHED_AUTOGROUP is not set
# CONFIG_RELAY is not set
# CONFIG_BLK_DEV_INITRD is not set
CONFIG_CC_OPTIMIZE_FOR_SIZE=y
# CONFIG_SYSCTL_SYSCALL is not set
CONFIG_EMBEDDED=y
CONFIG_EXPERT=y

# BusyBox needs these
CONFIG_BINFMT_ELF=y
CONFIG_BINFMT_SCRIPT=y

# initramfs support (CRITICAL)
CONFIG_BLK_DEV_INITRD=y
CONFIG_INITRAMFS_SOURCE=""
CONFIG_RD_GZIP=y
CONFIG_RD_XZ=y
CONFIG_RD_ZSTD=y

#=============================================================================
# Processor Type
#=============================================================================
CONFIG_M686=y
# CONFIG_M486 is not set
# CONFIG_M586 is not set
# CONFIG_MCORE2 is not set
CONFIG_X86_GENERIC=y

# Disable SMP (single CPU only for size)
# CONFIG_SMP is not set
CONFIG_NR_CPUS=1

# Disable power management
# CONFIG_PM is not set
# CONFIG_ACPI is not set
# CONFIG_APM is not set

#=============================================================================
# Memory & Storage
#=============================================================================
# Minimal memory support
CONFIG_FLATMEM=y
CONFIG_FLAT_NODE_MEM_MAP=y
# CONFIG_SPARSEMEM_STATIC is not set
# CONFIG_MEMORY_HOTPLUG is not set
CONFIG_PAGEFLAGS_EXTENDED=y
CONFIG_SPLIT_PTLOCK_CPUS=4

# Block devices
CONFIG_BLOCK=y
# CONFIG_BLK_DEV_BSG is not set
# CONFIG_BLK_DEV_BSGLIB is not set
# CONFIG_BLK_DEV_INTEGRITY is not set
# CONFIG_BLK_DEV_ZONED is not set
# CONFIG_BLK_WBT is not set

# Disk support (floppy!)
CONFIG_BLK_DEV=y
CONFIG_BLK_DEV_FD=y
CONFIG_BLK_DEV_LOOP=y
# CONFIG_BLK_DEV_LOOP_MIN_COUNT is not set

# IDE/ATA (for QEMU and real hardware)
CONFIG_ATA=y
CONFIG_ATA_PIIX=y
CONFIG_ATA_GENERIC=y
# CONFIG_SATA_AHCI is not set

# Virtio for QEMU (optional but useful)
CONFIG_VIRTIO_MENU=y
CONFIG_VIRTIO_PCI=y
CONFIG_VIRTIO_BLK=y

#=============================================================================
# Filesystems
#=============================================================================
# Essential filesystems only
CONFIG_EXT2_FS=y
# CONFIG_EXT3_FS is not set
# CONFIG_EXT4_FS is not set

# FAT for floppy
CONFIG_VFAT_FS=y
CONFIG_FAT_FS=y
CONFIG_MSDOS_FS=y
CONFIG_FAT_DEFAULT_CODEPAGE=437
CONFIG_FAT_DEFAULT_IOCHARSET="iso8859-1"
CONFIG_NLS=y
CONFIG_NLS_CODEPAGE_437=y
CONFIG_NLS_ISO8859_1=y

# Pseudo-filesystems (required)
CONFIG_PROC_FS=y
CONFIG_PROC_SYSCTL=y
CONFIG_SYSFS=y
CONFIG_TMPFS=y
CONFIG_DEVTMPFS=y
CONFIG_DEVTMPFS_MOUNT=y

# initramfs filesystem support
CONFIG_INITRAMFS_SOURCE=""

#=============================================================================
# Console & TTY
#=============================================================================
CONFIG_TTY=y
CONFIG_VT=y
CONFIG_CONSOLE_TRANSLATIONS=y
CONFIG_VT_CONSOLE=y
CONFIG_VT_CONSOLE_SLEEP=y
CONFIG_HW_CONSOLE=y
CONFIG_VT_HW_CONSOLE_BINDING=y
CONFIG_UNIX98_PTYS=y

# Framebuffer console (optional, adds ~20KB)
# CONFIG_FB is not set
CONFIG_VGA_CONSOLE=y
CONFIG_DUMMY_CONSOLE=y

# Serial console (essential for headless/QEMU)
CONFIG_SERIAL_8250=y
CONFIG_SERIAL_8250_CONSOLE=y
CONFIG_SERIAL_8250_NR_UARTS=4
CONFIG_SERIAL_8250_RUNTIME_UARTS=4

#=============================================================================
# Input Devices
#=============================================================================
CONFIG_INPUT=y
CONFIG_INPUT_KEYBOARD=y
CONFIG_KEYBOARD_ATKBD=y
# CONFIG_INPUT_MOUSE is not set
# CONFIG_INPUT_JOYSTICK is not set
# CONFIG_INPUT_TABLET is not set
# CONFIG_INPUT_TOUCHSCREEN is not set
# CONFIG_INPUT_MISC is not set

CONFIG_SERIO=y
CONFIG_SERIO_I8042=y
CONFIG_SERIO_LIBPS2=y

#=============================================================================
# Networking (Minimal - for rescue operations)
#=============================================================================
# Disable networking entirely to save ~100KB
# CONFIG_NET is not set

# If you need networking, uncomment below:
# CONFIG_NET=y
# CONFIG_PACKET=y
# CONFIG_UNIX=y
# CONFIG_INET=y
# CONFIG_IP_PNP=y
# CONFIG_IP_PNP_DHCP=y
# CONFIG_NETDEVICES=y
# CONFIG_NET_CORE=y
# CONFIG_VIRTIO_NET=y

#=============================================================================
# Disable Everything Else
#=============================================================================
# No modules (monolithic kernel)
# CONFIG_MODULES is not set

# No PCI by default (saves significant space)
# If needed for real hardware, enable CONFIG_PCI
# CONFIG_PCI is not set

# Uncomment for real hardware / QEMU with specific devices
CONFIG_PCI=y
CONFIG_PCI_QUIRKS=y

# Disable USB (saves ~50KB)
# CONFIG_USB_SUPPORT is not set

# Disable sound
# CONFIG_SOUND is not set

# Disable graphics
# CONFIG_DRM is not set

# Disable crypto (except what's needed for kernel)
# CONFIG_CRYPTO is not set

# Disable security modules
# CONFIG_SECURITY is not set
# CONFIG_SECURITYFS is not set

# Disable debugging
# CONFIG_DEBUG_KERNEL is not set
# CONFIG_DEBUG_MISC is not set
# CONFIG_DEBUG_FS is not set
# CONFIG_PRINTK_TIME is not set
# CONFIG_PRINTK is not set
# Actually, keep printk for debugging
CONFIG_PRINTK=y

# Disable kernel hardening (saves space)
# CONFIG_STACKPROTECTOR is not set
# CONFIG_RETPOLINE is not set

# Disable profiling
# CONFIG_PROFILING is not set
# CONFIG_TRACING is not set
```

---

## 5. BusyBox Configuration

Minimal BusyBox with only essential applets:

```bash
# File: config/busybox.config
# MicroLinux BusyBox Configuration
# Generate base with: make defconfig
# Then apply these overrides

#=============================================================================
# Build Options
#=============================================================================
CONFIG_STATIC=y
CONFIG_FEATURE_BUFFERS_USE_MALLOC=y
CONFIG_SHOW_USAGE=y
CONFIG_FEATURE_VERBOSE_USAGE=y
CONFIG_LONG_OPTS=y
CONFIG_FEATURE_DEVPTS=y
CONFIG_PID_FILE_PATH="/var/run"
CONFIG_BUSYBOX=y

# Strip/optimize
CONFIG_LFS=y
CONFIG_BUILD_LIBBUSYBOX=n
CONFIG_FEATURE_LIBBUSYBOX_STATIC=n
CONFIG_FEATURE_INDIVIDUAL=n
CONFIG_FEATURE_SHARED_BUSYBOX=n

# Cross-compile settings
CONFIG_CROSS_COMPILER_PREFIX=""
CONFIG_SYSROOT=""
CONFIG_EXTRA_CFLAGS="-Os -fomit-frame-pointer -fno-stack-protector"
CONFIG_EXTRA_LDFLAGS="-static"
CONFIG_EXTRA_LDLIBS=""
CONFIG_USE_PORTABLE_CODE=y

#=============================================================================
# General Configuration
#=============================================================================
CONFIG_FEATURE_SYSTEMD=n
CONFIG_FEATURE_RTMINMAX=y
CONFIG_FEATURE_PREFER_APPLETS=y
CONFIG_BUSYBOX_EXEC_PATH="/proc/self/exe"
CONFIG_FEATURE_SUID=y
CONFIG_FEATURE_SUID_CONFIG=n
CONFIG_FEATURE_INSTALLER=y
CONFIG_INSTALL_NO_USR=y
CONFIG_LOCALE_SUPPORT=n

#=============================================================================
# Applet Selection - CORE SHELL
#=============================================================================
CONFIG_ASH=y
CONFIG_ASH_OPTIMIZE_FOR_SIZE=y
CONFIG_ASH_INTERNAL_GLOB=y
CONFIG_ASH_BASH_COMPAT=y
CONFIG_ASH_JOB_CONTROL=y
CONFIG_ASH_ALIAS=y
CONFIG_ASH_RANDOM_SUPPORT=y
CONFIG_ASH_EXPAND_PRMT=y
CONFIG_ASH_ECHO=y
CONFIG_ASH_PRINTF=y
CONFIG_ASH_TEST=y
CONFIG_ASH_CMDCMD=y

#=============================================================================
# Applet Selection - CORE UTILITIES
#=============================================================================
# Essential commands
CONFIG_CAT=y
CONFIG_CHMOD=y
CONFIG_CHOWN=y
CONFIG_CP=y
CONFIG_DATE=y
CONFIG_DD=y
CONFIG_DF=y
CONFIG_DMESG=y
CONFIG_DU=y
CONFIG_ECHO=y
CONFIG_ENV=y
CONFIG_EXPR=y
CONFIG_FALSE=y
CONFIG_HEAD=y
CONFIG_ID=y
CONFIG_KILL=y
CONFIG_LN=y
CONFIG_LS=y
CONFIG_FEATURE_LS_SORTFILES=y
CONFIG_FEATURE_LS_TIMESTAMPS=y
CONFIG_FEATURE_LS_USERNAME=y
CONFIG_FEATURE_LS_COLOR=n
CONFIG_MKDIR=y
CONFIG_MKFIFO=y
CONFIG_MKNOD=y
CONFIG_MV=y
CONFIG_NICE=y
CONFIG_PRINTF=y
CONFIG_PS=y
CONFIG_PWD=y
CONFIG_RM=y
CONFIG_RMDIR=y
CONFIG_SLEEP=y
CONFIG_SORT=y
CONFIG_STAT=y
CONFIG_SYNC=y
CONFIG_TAIL=y
CONFIG_TEE=y
CONFIG_TEST=y
CONFIG_TOUCH=y
CONFIG_TR=y
CONFIG_TRUE=y
CONFIG_TTY=y
CONFIG_UNAME=y
CONFIG_UNIQ=y
CONFIG_WC=y
CONFIG_WHOAMI=y
CONFIG_YES=y

# Text processing
CONFIG_AWK=y
CONFIG_CUT=y
CONFIG_GREP=y
CONFIG_SED=y
CONFIG_VI=y
CONFIG_FEATURE_VI_COLON=y
CONFIG_FEATURE_VI_SEARCH=y

# Archive (for rescue)
CONFIG_TAR=y
CONFIG_FEATURE_TAR_CREATE=y
CONFIG_FEATURE_TAR_AUTODETECT=y
CONFIG_FEATURE_TAR_GNU_EXTENSIONS=y
CONFIG_GZIP=y
CONFIG_GUNZIP=y
CONFIG_ZCAT=y
CONFIG_XZ=y
CONFIG_UNXZ=y
CONFIG_XZCAT=y

#=============================================================================
# Applet Selection - SYSTEM
#=============================================================================
CONFIG_INIT=y
CONFIG_FEATURE_USE_INITTAB=y
CONFIG_FEATURE_INIT_SCTTY=y
CONFIG_FEATURE_INIT_SYSLOG=n
CONFIG_FEATURE_INIT_QUIET=n
CONFIG_HALT=y
CONFIG_POWEROFF=y
CONFIG_REBOOT=y

CONFIG_MOUNT=y
CONFIG_FEATURE_MOUNT_FLAGS=y
CONFIG_FEATURE_MOUNT_FSTAB=y
CONFIG_UMOUNT=y
CONFIG_FEATURE_UMOUNT_ALL=y

CONFIG_DMESG=y
CONFIG_MDEV=y
CONFIG_FEATURE_MDEV_CONF=n
CONFIG_FEATURE_MDEV_EXEC=n
CONFIG_SWAPON=y
CONFIG_SWAPOFF=y
CONFIG_LOSETUP=y
CONFIG_FREE=y
CONFIG_UPTIME=y

# Disk utilities (rescue)
CONFIG_FDISK=y
CONFIG_MKFS_EXT2=y
CONFIG_MKFS_VFAT=y
CONFIG_FSCK=n
CONFIG_BLKID=y

# Networking utilities (disabled for minimal build)
CONFIG_IFCONFIG=n
CONFIG_ROUTE=n
CONFIG_PING=n
CONFIG_WGET=n
CONFIG_NC=n

# Enable for network support:
# CONFIG_IFCONFIG=y
# CONFIG_ROUTE=y
# CONFIG_PING=y
# CONFIG_FEATURE_FANCY_PING=n
# CONFIG_IP=y
# CONFIG_WGET=y

#=============================================================================
# DISABLE - Large/Unnecessary
#=============================================================================
CONFIG_HUSH=n
CONFIG_FEATURE_SH_IS_ASH=y
CONFIG_FEATURE_BASH_IS_NONE=y
CONFIG_LASH=n
CONFIG_MSH=n

CONFIG_MAN=n
CONFIG_LESS=n
CONFIG_MORE=n
CONFIG_FEATURE_EDITING=y
CONFIG_FEATURE_EDITING_MAX_LEN=512
CONFIG_FEATURE_TAB_COMPLETION=y
CONFIG_FEATURE_EDITING_HISTORY=64
CONFIG_FEATURE_EDITING_SAVEHISTORY=n

CONFIG_HTTPD=n
CONFIG_FTPD=n
CONFIG_TELNETD=n
CONFIG_UDHCPC=n
CONFIG_UDHCPD=n

CONFIG_DPKG=n
CONFIG_APK=n
CONFIG_RPM=n

CONFIG_MODPROBE=n
CONFIG_INSMOD=n
CONFIG_RMMOD=n
CONFIG_LSMOD=n

CONFIG_SYSLOGD=n
CONFIG_KLOGD=n
CONFIG_LOGGER=n

CONFIG_CRONTAB=n
CONFIG_CROND=n
CONFIG_NTPD=n

CONFIG_SU=n
CONFIG_SUDO=n
CONFIG_PASSWD=n
CONFIG_ADDUSER=n
CONFIG_ADDGROUP=n
CONFIG_DELUSER=n
CONFIG_DELGROUP=n
CONFIG_GETTY=n
CONFIG_LOGIN=n

CONFIG_FEATURE_IPV6=n
CONFIG_FEATURE_PREFER_IPV4_ADDRESS=y
```

---

## 6. musl libc Cross-Compiler (Optional)

For even smaller binaries, use musl instead of glibc:

```bash
#!/bin/bash
# File: scripts/setup-musl-toolchain.sh
# Sets up musl-cross-make for building smaller static binaries

set -e

MUSL_CROSS_DIR="$BUILD_DIR/musl-cross-make"
TOOLCHAIN_DIR="$BUILD_DIR/toolchain"

if [ -d "$TOOLCHAIN_DIR/bin" ]; then
    echo "Toolchain already exists at $TOOLCHAIN_DIR"
    exit 0
fi

# Clone musl-cross-make
if [ ! -d "$MUSL_CROSS_DIR" ]; then
    git clone https://github.com/richfelker/musl-cross-make.git "$MUSL_CROSS_DIR"
fi

cd "$MUSL_CROSS_DIR"

# Configure for i686 target
cat > config.mak << EOF
TARGET = i686-linux-musl
OUTPUT = $TOOLCHAIN_DIR
GCC_VER = 11.2.0
MUSL_VER = 1.2.3
BINUTILS_VER = 2.37
GMP_VER = 6.2.1
MPC_VER = 1.2.1
MPFR_VER = 4.1.0
COMMON_CONFIG += --disable-nls
GCC_CONFIG += --disable-libquadmath --disable-decimal-float
GCC_CONFIG += --disable-libitm --disable-libmudflap
EOF

# Build (takes ~30 minutes)
make -j$(nproc)
make install

echo "musl toolchain installed to $TOOLCHAIN_DIR"
echo "Export: CROSS_COMPILE=$TOOLCHAIN_DIR/bin/i686-linux-musl-"
```

---

## 7. Init System

### 7.1 Main init script

```bash
#!/bin/sh
# File: rootfs/init
# MicroLinux init script - PID 1

# Immediately setup essential mounts
mount -t proc proc /proc
mount -t sysfs sys /sys
mount -t devtmpfs dev /dev 2>/dev/null || mdev -s

# Create essential device nodes if devtmpfs failed
[ -e /dev/null ]    || mknod /dev/null c 1 3
[ -e /dev/zero ]    || mknod /dev/zero c 1 5
[ -e /dev/tty ]     || mknod /dev/tty c 5 0
[ -e /dev/console ] || mknod /dev/console c 5 1
[ -e /dev/tty0 ]    || mknod /dev/tty0 c 4 0
[ -e /dev/tty1 ]    || mknod /dev/tty1 c 4 1
[ -e /dev/ttyS0 ]   || mknod /dev/ttyS0 c 4 64

# Create pts directory
mkdir -p /dev/pts
mount -t devpts devpts /dev/pts 2>/dev/null

# Create shm directory
mkdir -p /dev/shm
mount -t tmpfs shm /dev/shm 2>/dev/null

# Mount tmpfs for /tmp and /var
mount -t tmpfs tmpfs /tmp
mount -t tmpfs tmpfs /var
mkdir -p /var/log /var/run

# Set hostname
hostname micro

# Display boot message
clear 2>/dev/null
cat << 'EOF'

  __  __ _                _     _
 |  \/  (_) ___ _ __ ___ | |   (_)_ __  _   ___  __
 | |\/| | |/ __| '__/ _ \| |   | | '_ \| | | \ \/ /
 | |  | | | (__| | | (_) | |___| | | | | |_| |>  <
 |_|  |_|_|\___|_|  \___/|_____|_|_| |_|\__,_/_/\_\

   Booted successfully! Type 'help' for commands.

EOF

# Show system info
echo "Kernel: $(uname -sr)"
echo "Memory: $(grep MemTotal /proc/meminfo | awk '{print $2}') KB"
echo ""

# Check for init=/bin/sh emergency mode
if grep -q "init=/bin/sh" /proc/cmdline 2>/dev/null; then
    echo "Emergency mode - dropping to shell"
    exec /bin/sh
fi

# Start init proper if inittab exists, otherwise just spawn shell
if [ -f /etc/inittab ]; then
    exec /sbin/init
else
    # Direct shell - simple but functional
    echo "No inittab found, spawning shell directly"
    export HOME=/root
    export PATH=/bin:/sbin:/usr/bin:/usr/sbin
    export TERM=linux
    cd /root
    exec /bin/sh -l
fi
```

### 7.2 inittab (BusyBox init format)

```bash
# File: rootfs/etc/inittab
# BusyBox init configuration

# System initialization
::sysinit:/bin/mount -o remount,rw /

# Start shell on console
::respawn:-/bin/sh

# Start shell on serial console (for QEMU -nographic)
ttyS0::respawn:-/bin/sh

# Ctrl-Alt-Del handling
::ctrlaltdel:/sbin/reboot

# Shutdown actions
::shutdown:/bin/umount -a -r
::shutdown:/sbin/swapoff -a
```

### 7.3 Shell profile

```bash
# File: rootfs/etc/profile
# Shell environment setup

export PATH=/bin:/sbin:/usr/bin:/usr/sbin
export HOME=/root
export TERM=linux
export PS1='\[\033[1;32m\]micro\[\033[0m\]:\[\033[1;34m\]\w\[\033[0m\]\$ '

# Aliases
alias ll='ls -la'
alias la='ls -A'
alias l='ls -CF'
alias ..='cd ..'
alias cls='clear'

# Welcome message
echo "Type 'poweroff' or 'reboot' to shutdown."
```

### 7.4 System files

```bash
# File: rootfs/etc/passwd
root:x:0:0:root:/root:/bin/sh
nobody:x:65534:65534:Nobody:/nonexistent:/bin/false
```

```bash
# File: rootfs/etc/group
root:x:0:
nogroup:x:65534:
```

```bash
# File: rootfs/etc/shadow
root::0:0:99999:7:::
nobody:*:0:0:99999:7:::
```

```bash
# File: rootfs/etc/issue
MicroLinux \r (\m)
```

---

## 8. Root Filesystem Assembly

```bash
#!/bin/bash
# File: scripts/04-create-rootfs.sh
# Detailed rootfs creation with size tracking

set -e

ROOTFS="$BUILD_DIR/rootfs"
BUSYBOX="$BUILD_DIR/busybox-${BUSYBOX_VERSION}/busybox"

echo "Creating root filesystem structure..."

# Create directory hierarchy
mkdir -p "$ROOTFS"/{bin,sbin,usr/bin,usr/sbin}
mkdir -p "$ROOTFS"/{etc,proc,sys,dev,tmp,root,var/log,var/run}
mkdir -p "$ROOTFS"/dev/{pts,shm}

# Set permissions
chmod 1777 "$ROOTFS/tmp"
chmod 700 "$ROOTFS/root"

echo "Installing BusyBox..."

# Copy and strip BusyBox
cp "$BUSYBOX" "$ROOTFS/bin/busybox"
chmod 755 "$ROOTFS/bin/busybox"

# Create symlinks for all applets
cd "$ROOTFS/bin"
for applet in $("$ROOTFS/bin/busybox" --list); do
    [ "$applet" = "busybox" ] && continue
    ln -sf busybox "$applet" 2>/dev/null || true
done

# Create symlinks in /sbin for system commands
cd "$ROOTFS/sbin"
for cmd in init halt reboot poweroff mount umount mdev; do
    ln -sf ../bin/busybox "$cmd" 2>/dev/null || true
done

cd "$PROJECT_ROOT"

echo "Installing configuration files..."

# Copy init script
cp "$ROOTFS_TEMPLATE/init" "$ROOTFS/init"
chmod 755 "$ROOTFS/init"

# Copy etc files
cp -r "$ROOTFS_TEMPLATE/etc/"* "$ROOTFS/etc/" 2>/dev/null || true

# Set permissions on sensitive files
chmod 640 "$ROOTFS/etc/shadow" 2>/dev/null || true
chmod 644 "$ROOTFS/etc/passwd" "$ROOTFS/etc/group" 2>/dev/null || true

# Create minimal device nodes (devtmpfs handles most)
# These are fallbacks if devtmpfs isn't available
cd "$ROOTFS/dev"
[ ! -e console ] && sudo mknod -m 600 console c 5 1
[ ! -e null ]    && sudo mknod -m 666 null c 1 3
[ ! -e zero ]    && sudo mknod -m 666 zero c 1 5
[ ! -e tty ]     && sudo mknod -m 666 tty c 5 0
cd "$PROJECT_ROOT"

# Size report
echo ""
echo "=== Root Filesystem Size Report ==="
echo "Total: $(du -sh "$ROOTFS" | cut -f1)"
echo ""
echo "Breakdown:"
du -sh "$ROOTFS"/* 2>/dev/null | sort -h
echo ""
echo "BusyBox size: $(stat -c%s "$ROOTFS/bin/busybox") bytes"
```

---

## 9. Bootloader Integration

### 9.1 SYSLINUX Configuration

```bash
# File: syslinux.cfg (copied to floppy)
DEFAULT linux
PROMPT 0
TIMEOUT 30
ONTIMEOUT linux

UI menu.c32

MENU TITLE MicroLinux Boot Menu
MENU COLOR border       30;44   #40ffffff #a0000000 std
MENU COLOR title        1;36;44 #9033ccff #a0000000 std
MENU COLOR sel          7;37;40 #e0ffffff #20ffffff all
MENU COLOR unsel        37;44   #50ffffff #a0000000 std
MENU COLOR help         37;40   #c0ffffff #a0000000 std
MENU COLOR timeout_msg  37;40   #80ffffff #00000000 std
MENU COLOR timeout      1;37;40 #c0ffffff #00000000 std

LABEL linux
    MENU LABEL ^MicroLinux (Normal Boot)
    KERNEL vmlinuz
    APPEND initrd=initram quiet
    
LABEL linux-serial
    MENU LABEL MicroLinux (^Serial Console)
    KERNEL vmlinuz
    APPEND initrd=initram console=ttyS0,115200
    
LABEL linux-verbose
    MENU LABEL MicroLinux (^Verbose Boot)
    KERNEL vmlinuz
    APPEND initrd=initram

LABEL linux-emergency
    MENU LABEL MicroLinux (^Emergency Shell)
    KERNEL vmlinuz
    APPEND initrd=initram init=/bin/sh
```

### 9.2 Alternative: Direct kernel boot (no bootloader)

For absolute minimum size, boot kernel directly without syslinux:

```bash
#!/bin/bash
# Direct kernel boot floppy (EXPERIMENTAL)
# Requires kernel built with CONFIG_BOOT_RAW=y

# Embed initramfs directly in kernel:
# Set CONFIG_INITRAMFS_SOURCE="/path/to/rootfs" in kernel config
# This creates a single-file bootable kernel

# Create raw floppy:
dd if="$OUTPUT_DIR/bzImage" of="$OUTPUT_DIR/floppy.img" bs=512 count=2880
```

---

## 10. Final Image Creation

### 10.1 Standard FAT12 floppy method

```bash
#!/bin/bash
# File: scripts/06-create-floppy.sh

set -e

FLOPPY="$OUTPUT_DIR/floppy.img"
KERNEL="$OUTPUT_DIR/vmlinuz"
INITRAMFS="$OUTPUT_DIR/initramfs"
MNT="$BUILD_DIR/floppy_mnt"

echo "Creating bootable floppy image..."

# Create 1.44MB floppy image
dd if=/dev/zero of="$FLOPPY" bs=512 count=2880 status=none

# Create FAT12 filesystem
mkfs.vfat -F 12 -n "MICROLINUX" "$FLOPPY"

# Install SYSLINUX bootloader
syslinux --install "$FLOPPY"

# Mount and copy files
mkdir -p "$MNT"
sudo mount -o loop "$FLOPPY" "$MNT"

# Copy kernel (8.3 filename for FAT)
sudo cp "$KERNEL" "$MNT/vmlinuz"

# Copy initramfs (8.3 filename)
sudo cp "$INITRAMFS" "$MNT/initram"

# Create syslinux config
sudo tee "$MNT/syslinux.cfg" > /dev/null << 'SYSLINUX'
DEFAULT linux
PROMPT 1
TIMEOUT 30
SAY MicroLinux - Press ENTER to boot

LABEL linux
    KERNEL vmlinuz
    APPEND initrd=initram quiet
SYSLINUX

# Copy optional boot message
if [ -f "$PROJECT_ROOT/rootfs/etc/issue" ]; then
    sudo cp "$PROJECT_ROOT/rootfs/etc/issue" "$MNT/boot.msg"
fi

# Show contents
echo ""
echo "Floppy contents:"
ls -la "$MNT"
echo ""
echo "Space usage:"
df -h "$MNT"

# Cleanup
sync
sudo umount "$MNT"
rmdir "$MNT"

# Final size check
SIZE=$(stat -c%s "$FLOPPY")
LIMIT=1474560

echo ""
echo "=== Final Image ==="
echo "Size: $SIZE bytes"
echo "Limit: $LIMIT bytes (1.44MB)"
echo "Used: $((SIZE * 100 / LIMIT))%"

if [ "$SIZE" -le "$LIMIT" ]; then
    echo "✓ Image fits on floppy!"
else
    echo "✗ Image too large by $((SIZE - LIMIT)) bytes!"
    exit 1
fi
```

### 10.2 Alternative: Embedded initramfs (single file)

```bash
#!/bin/bash
# Build kernel with embedded initramfs for single-file boot

# In kernel config, set:
# CONFIG_INITRAMFS_SOURCE="/absolute/path/to/rootfs"

# This embeds the entire filesystem into the kernel binary
# Result: Single vmlinuz file that's fully self-contained

# For floppy boot:
dd if=/dev/zero of=floppy.img bs=512 count=2880
syslinux --install floppy.img
# Use mtools to copy:
mcopy -i floppy.img vmlinuz ::vmlinuz
mcopy -i floppy.img syslinux.cfg ::syslinux.cfg
```

---

## 11. Testing & Debugging

### 11.1 QEMU Test Commands

```bash
#!/bin/bash
# File: test.sh
# Test MicroLinux in QEMU

FLOPPY="output/floppy.img"

echo "=== MicroLinux Testing ==="
echo ""

case "${1:-gui}" in
    gui)
        echo "Starting QEMU with display..."
        qemu-system-i386 \
            -fda "$FLOPPY" \
            -m 64M \
            -boot a
        ;;
    serial)
        echo "Starting QEMU with serial console..."
        echo "(Press Ctrl-A X to exit)"
        qemu-system-i386 \
            -fda "$FLOPPY" \
            -m 64M \
            -boot a \
            -nographic \
            -serial mon:stdio
        ;;
    curses)
        echo "Starting QEMU with curses display..."
        qemu-system-i386 \
            -fda "$FLOPPY" \
            -m 64M \
            -boot a \
            -curses
        ;;
    debug)
        echo "Starting QEMU in debug mode..."
        qemu-system-i386 \
            -fda "$FLOPPY" \
            -m 64M \
            -boot a \
            -nographic \
            -serial mon:stdio \
            -d int,cpu_reset \
            -no-reboot
        ;;
    gdb)
        echo "Starting QEMU with GDB server on :1234..."
        qemu-system-i386 \
            -fda "$FLOPPY" \
            -m 64M \
            -boot a \
            -s -S \
            -nographic
        ;;
    *)
        echo "Usage: $0 {gui|serial|curses|debug|gdb}"
        exit 1
        ;;
esac
```

### 11.2 Boot Troubleshooting

```bash
# Common issues and solutions:

# 1. Kernel panic - not syncing: VFS: Unable to mount root fs
#    - Check initramfs is correctly compressed
#    - Verify kernel has CONFIG_BLK_DEV_INITRD=y
#    - Check compression support (CONFIG_RD_GZIP, CONFIG_RD_XZ)

# 2. Kernel panic - not syncing: No init found
#    - Verify /init exists in initramfs and is executable
#    - Check /init has correct shebang (#!/bin/sh)
#    - Try: init=/bin/sh in kernel cmdline

# 3. "sh: can't access tty" errors
#    - Normal if CONFIG_VT is disabled
#    - Use serial console: console=ttyS0,115200

# 4. Blank screen (no output)
#    - Add 'console=ttyS0,115200 console=tty0' to cmdline
#    - Use QEMU with -nographic

# Debug: Extract and inspect initramfs
mkdir /tmp/initramfs_debug
cd /tmp/initramfs_debug
xz -d < /path/to/initramfs.cpio.xz | cpio -idmv
ls -la
cat init
```

### 11.3 Size Analysis Tools

```bash
#!/bin/bash
# File: analyze-size.sh
# Detailed size analysis

echo "=== Kernel Size Analysis ==="
ls -lh output/vmlinuz
size build/linux-*/vmlinux 2>/dev/null || true

echo ""
echo "=== Initramfs Contents ==="
mkdir -p /tmp/initramfs_analysis
cd /tmp/initramfs_analysis
rm -rf *

# Extract based on compression
file ../../../microlinux/output/initramfs | grep -q "XZ" && \
    xz -d < ../../../microlinux/output/initramfs | cpio -idmv 2>/dev/null
file ../../../microlinux/output/initramfs | grep -q "gzip" && \
    gzip -d < ../../../microlinux/output/initramfs | cpio -idmv 2>/dev/null

echo ""
echo "Directory sizes:"
du -sh */ 2>/dev/null | sort -h

echo ""
echo "Largest files:"
find . -type f -exec ls -lh {} \; | sort -k5 -h | tail -20

echo ""
echo "BusyBox applets enabled:"
./bin/busybox --list | wc -l
echo "applets"

cd - > /dev/null
```

---

## 12. Size Optimization Techniques

### 12.1 Kernel Optimization

```bash
# Additional kernel size reductions:

# 1. Use XZ compression (best ratio)
CONFIG_KERNEL_XZ=y

# 2. Optimize for size
CONFIG_CC_OPTIMIZE_FOR_SIZE=y

# 3. Disable printk (saves ~10KB, but no debug output!)
# CONFIG_PRINTK is not set

# 4. Disable kallsyms (saves ~20-50KB)
# CONFIG_KALLSYMS is not set

# 5. Disable modules
# CONFIG_MODULES is not set

# 6. Disable debugging
# CONFIG_DEBUG_INFO is not set
# CONFIG_DEBUG_KERNEL is not set

# 7. Remove unnecessary drivers
# Only include: floppy, IDE, VGA console, serial, keyboard

# 8. Use compiler flags
KCFLAGS="-Os -fno-stack-protector -fomit-frame-pointer"
```

### 12.2 BusyBox Optimization

```bash
# BusyBox size reduction:

# 1. Disable all non-essential applets (see config above)

# 2. Build with musl instead of glibc
# Typically saves 100-200KB for static binaries

# 3. Use dietlibc for even smaller size
# dietlibc can produce ~30-50% smaller binaries

# 4. Strip aggressively
strip --strip-all busybox
# Or: strip -s -R .comment -R .gnu.version busybox

# 5. UPX compression (EXPERIMENTAL - may cause issues)
upx --best --lzma busybox
# Warning: UPX'd binaries use more memory at runtime
```

### 12.3 Initramfs Optimization

```bash
# Initramfs size reduction:

# 1. Compare compression algorithms
# XZ -9:    Best ratio, slow decompression
# ZSTD -19: Good ratio, fast decompression  
# GZIP -9:  Moderate ratio, widest support
# LZ4:      Worst ratio, fastest decompression

# Test all and pick smallest:
find rootfs -print0 | cpio --null -o -H newc | xz -9 > initramfs.xz
find rootfs -print0 | cpio --null -o -H newc | zstd -19 > initramfs.zst
find rootfs -print0 | cpio --null -o -H newc | gzip -9 > initramfs.gz

# 2. Remove unnecessary files
rm -rf rootfs/usr/share/doc
rm -rf rootfs/usr/share/man
rm -rf rootfs/usr/share/info

# 3. Remove unused BusyBox applets (recompile with minimal config)
```

### 12.4 Size Budget Example

```
Target: 1,474,560 bytes (1.44MB floppy)

Typical allocation:
├── SYSLINUX bootloader:      ~15,000 bytes
├── syslinux.cfg:                 ~500 bytes
├── Kernel (vmlinuz):        ~500,000 bytes  (34%)
├── Initramfs (compressed):  ~350,000 bytes  (24%)
│   ├── BusyBox:            ~200,000 bytes
│   ├── Init scripts:          ~5,000 bytes
│   └── Config files:          ~2,000 bytes
└── FAT12 overhead:           ~50,000 bytes
─────────────────────────────────────────────
Total:                       ~915,000 bytes  (62%)
Remaining:                   ~559,000 bytes  (38%)

This leaves room for:
- Additional utilities
- Documentation
- Rescue tools
- Network support
```

---

## 13. Troubleshooting Guide

### Common Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| Kernel too large (>800KB) | Too many drivers enabled | Review .config, disable unused features |
| BusyBox too large (>400KB) | Too many applets | Disable non-essential applets |
| Boot hangs at "Loading initramfs" | Wrong compression format | Check kernel CONFIG_RD_* matches compression |
| "No init found" panic | Missing /init in initramfs | Verify init script exists and is executable |
| Shell exits immediately | No controlling TTY | Add CONFIG_VT=y or use serial console |
| Can't mount filesystems | Missing fs drivers | Enable CONFIG_EXT2_FS, CONFIG_VFAT_FS |
| Keyboard doesn't work | Missing input drivers | Enable CONFIG_KEYBOARD_ATKBD |
| QEMU shows blank screen | No video driver | Use -nographic or enable CONFIG_VGA_CONSOLE |

### Diagnostic Commands

```bash
# Inside MicroLinux:

# Check memory
free
cat /proc/meminfo

# Check mounted filesystems
mount
cat /proc/mounts

# Check loaded (builtin) kernel features
cat /proc/version
zcat /proc/config.gz  # if enabled

# Check hardware detection
cat /proc/cpuinfo
cat /proc/devices
cat /proc/partitions

# Check boot messages
dmesg | head -50
dmesg | grep -i error

# Check init
ps aux
cat /proc/1/cmdline
```

---

## Quick Start

```bash
# 1. Initialize project
./init-project.sh
cd microlinux

# 2. Copy all config files from this document to their locations

# 3. Build
chmod +x build.sh
./build.sh

# 4. Test
./test.sh serial
# (Press Ctrl-A X to exit QEMU)

# 5. Write to real floppy (if you have one!)
sudo dd if=output/floppy.img of=/dev/fd0 bs=512
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025 | Initial implementation plan |

---

*This implementation plan was generated for the MicroLinux project.*
*Target: 1.44MB bootable floppy disk with modern Linux kernel and BusyBox userspace.*
