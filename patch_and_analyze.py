#!/usr/bin/env python3
"""Patch the VVM binary to bypass ptrace check, then use GDB to dump handlers."""
import shutil
import struct

SRC = "/workspace/vvm_challenge/rev_vvm/vvm"
DST = "/workspace/vvm_challenge/rev_vvm/vvm_patched"

shutil.copy2(SRC, DST)

with open(DST, "r+b") as f:
    # At offset 0x13fa in the binary, there's: 78 05 (js +5 to exit)
    # Patch to: 90 90 (nop nop) - so it never jumps to exit(1)
    f.seek(0x13fa)
    original = f.read(2)
    print(f"Original bytes at 0x13fa: {original.hex()}")
    f.seek(0x13fa)
    f.write(b'\x90\x90')
    print("Patched to: 9090 (nop nop)")

import os
os.chmod(DST, 0o755)

# Verify patch
with open(DST, "rb") as f:
    f.seek(0x13fa)
    patched = f.read(2)
    print(f"Patched bytes at 0x13fa: {patched.hex()}")

print("\nPatched binary created at:", DST)
