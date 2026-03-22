#!/usr/bin/env python3
"""
VVM Challenge Solver
Analyzes the VVM binary by extracting the bytecode and simulating the VM.
"""

import struct
import subprocess
import os

BINARY = "/workspace/vvm_challenge/rev_vvm/vvm"

# Read the binary
with open(BINARY, "rb") as f:
    binary = f.read()

# The binary is PIE, base address in file starts at 0
# ELF sections from readelf:
# .data at offset... let me find it

# From objdump -h, .data section
# Let's find it from readelf
# .data is at file offset matching virtual address 0x5000 (PIE)

# Find the .data section offset
# The binary maps .data at VA 0x5000
# For PIE, the file offset = VA for the data segment (they're the same in the file)
# Actually from readelf, we need to figure out the offset

# Let me just extract from the ELF
import struct

# Parse ELF header to find section headers
e_shoff = struct.unpack_from('<Q', binary, 0x28)[0]  # section header offset
e_shnum = struct.unpack_from('<H', binary, 0x3c)[0]  # number of sections
e_shentsize = struct.unpack_from('<H', binary, 0x3a)[0]
e_shstrndx = struct.unpack_from('<H', binary, 0x3e)[0]

# Get section header string table
shstrtab_offset = struct.unpack_from('<Q', binary, e_shoff + e_shstrndx * e_shentsize + 0x18)[0]

sections = {}
for i in range(e_shnum):
    sh_offset = e_shoff + i * e_shentsize
    sh_name = struct.unpack_from('<I', binary, sh_offset)[0]
    sh_addr = struct.unpack_from('<Q', binary, sh_offset + 0x10)[0]
    sh_file_offset = struct.unpack_from('<Q', binary, sh_offset + 0x18)[0]
    sh_size = struct.unpack_from('<Q', binary, sh_offset + 0x20)[0]
    
    # Get name
    name_end = binary.index(b'\x00', shstrtab_offset + sh_name)
    name = binary[shstrtab_offset + sh_name:name_end].decode('ascii', errors='replace')
    sections[name] = (sh_addr, sh_file_offset, sh_size)

print("Sections found:")
for name, (addr, offset, size) in sections.items():
    if name:
        print(f"  {name}: addr=0x{addr:x}, offset=0x{offset:x}, size=0x{size:x}")

# Get .data section
data_addr, data_offset, data_size = sections['.data']
print(f"\n.data: VA=0x{data_addr:x}, file_offset=0x{data_offset:x}, size=0x{data_size:x}")

# Extract raw data section
data_section = binary[data_offset:data_offset + data_size]

def read_data_u32(va):
    """Read a 32-bit value from virtual address in .data"""
    off = va - data_addr
    return struct.unpack_from('<I', data_section, off)[0]

def read_data_bytes(va, size):
    """Read bytes from virtual address in .data"""
    off = va - data_addr
    return data_section[off:off+size]

# Bytecode starts at VA 0x5540 
# First dword at 0x5540 is the initial opcode: 0x19
# Bytecode pointer starts at 0x5544

bytecode_start = 0x5540
first_opcode = read_data_u32(bytecode_start)
print(f"\nFirst value at bytecode_start (0x{bytecode_start:x}): 0x{first_opcode:x}")

# The VM loop:
# 1. Read opcode (4 bytes) from PC
# 2. If opcode == 0x1c, halt
# 3. Call handler[opcode] via jump table
# 4. PC += 4, read next opcode, repeat

# Let's extract all the bytecode as 32-bit integers
# The bytecode runs from 0x5544 (after initial check) until we find halt (0x1c)
# Actually: first opcode is at 0x5540, then PC is set to 0x5544

# Let's dump all the bytecodes
bc_offset = bytecode_start - data_addr
all_opcodes = []
idx = 0
pos = bc_offset
while pos + 4 <= len(data_section):
    val = struct.unpack_from('<I', data_section, pos)[0]
    all_opcodes.append(val)
    pos += 4
    idx += 1

print(f"\nTotal dwords from bytecode area: {len(all_opcodes)}")
print("Bytecodes (first 200):")
for i, op in enumerate(all_opcodes[:200]):
    addr = bytecode_start + i * 4
    print(f"  [{i:3d}] 0x{addr:04x}: 0x{op:08x} ({op})")

# Find the halt opcode (0x1c = 28)
halt_positions = [i for i, op in enumerate(all_opcodes) if op == 0x1c]
print(f"\nHalt opcode (0x1c) positions: {halt_positions}")
