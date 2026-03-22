#!/usr/bin/env python3
"""
VVM - Detailed trace of password validation logic.
"""

import struct

BINARY = "/workspace/vvm_challenge/rev_vvm/vvm"

with open(BINARY, "rb") as f:
    binary = f.read()

e_shoff = struct.unpack_from('<Q', binary, 0x28)[0]
e_shnum = struct.unpack_from('<H', binary, 0x3c)[0]
e_shentsize = struct.unpack_from('<H', binary, 0x3a)[0]
e_shstrndx = struct.unpack_from('<H', binary, 0x3e)[0]
shstrtab_offset = struct.unpack_from('<Q', binary, e_shoff + e_shstrndx * e_shentsize + 0x18)[0]

sections = {}
for i in range(e_shnum):
    sh_offset = e_shoff + i * e_shentsize
    sh_name = struct.unpack_from('<I', binary, sh_offset)[0]
    sh_addr = struct.unpack_from('<Q', binary, sh_offset + 0x10)[0]
    sh_file_offset = struct.unpack_from('<Q', binary, sh_offset + 0x18)[0]
    sh_size = struct.unpack_from('<Q', binary, sh_offset + 0x20)[0]
    name_end = binary.index(b'\x00', shstrtab_offset + sh_name)
    name = binary[shstrtab_offset + sh_name:name_end].decode('ascii', errors='replace')
    sections[name] = (sh_addr, sh_file_offset, sh_size)

data_addr, data_offset, data_size = sections['.data']
data_section = binary[data_offset:data_offset + data_size]

BC_START_VA = 0x5540
bc_file_offset = BC_START_VA - data_addr
all_dwords = []
pos = bc_file_offset
while pos + 4 <= len(data_section):
    val = struct.unpack_from('<I', data_section, pos)[0]
    all_dwords.append(val)
    pos += 4

OPNAMES = {
    0x00: "strlen", 0x01: "shl", 0x02: "mod", 0x03: "input",
    0x04: "div", 0x05: "add", 0x06: "mul", 0x07: "ptrace",
    0x08: "or", 0x09: "mod3p17", 0x0a: "print", 0x0b: "jmp_fwd",
    0x0c: "affine", 0x0d: "strip_nl", 0x0e: "pop0", 0x0f: "pack_str",
    0x10: "dup_at", 0x11: "call", 0x12: "char_at", 0x13: "eq",
    0x14: "neq", 0x15: "mul8p24", 0x16: "cond_jmp", 0x17: "dup",
    0x18: "sub", 0x19: "push", 0x1a: "shr", 0x1b: "jmp_back",
    0x1c: "halt"
}

def disasm_bytecodes():
    """Disassemble the bytecodes."""
    i = 0
    while i < len(all_dwords):
        op = all_dwords[i]
        name = OPNAMES.get(op, f"unk_{op:#x}")
        
        if op == 0x19:  # push immediate
            if i+1 < len(all_dwords):
                imm = all_dwords[i+1]
                # sign extend
                if imm >= 0x80000000:
                    simm = imm - 0x100000000
                else:
                    simm = imm
                print(f"  [{i:3d}] push {simm} (0x{imm:x})")
                i += 2
            else:
                print(f"  [{i:3d}] push ???")
                i += 1
        elif op == 0x03:  # input
            if i+1 < len(all_dwords):
                bufsz = all_dwords[i+1]
                print(f"  [{i:3d}] input(buf_size={bufsz})")
                i += 2
            else:
                print(f"  [{i:3d}] input ???")
                i += 1
        elif op == 0x0f:  # pack_string
            if i+1 < len(all_dwords):
                count = all_dwords[i+1]
                print(f"  [{i:3d}] pack_str(count={count})")
                i += 2
            else:
                print(f"  [{i:3d}] pack_str ???")
                i += 1
        elif op == 0x10:  # dup_at
            if i+1 < len(all_dwords):
                idx = all_dwords[i+1]
                print(f"  [{i:3d}] dup_at(index={idx})")
                i += 2
            else:
                print(f"  [{i:3d}] dup_at ???")
                i += 1
        elif op == 0x11:  # call
            if i+2 < len(all_dwords):
                offset = all_dwords[i+1]
                argc = all_dwords[i+2]
                if offset >= 0x80000000:
                    offset -= 0x100000000
                print(f"  [{i:3d}] call(offset={offset}, argc={argc})")
                i += 3
            else:
                print(f"  [{i:3d}] call ???")
                i += 1
        elif op == 0x12:  # char_at
            if i+1 < len(all_dwords):
                idx = all_dwords[i+1]
                print(f"  [{i:3d}] char_at(index={idx})")
                i += 2
            else:
                print(f"  [{i:3d}] char_at ???")
                i += 1
        elif op == 0x16:  # cond_jmp
            if i+1 < len(all_dwords):
                offset = all_dwords[i+1]
                if offset >= 0x80000000:
                    offset -= 0x100000000
                target = i + 1 + offset
                print(f"  [{i:3d}] cond_jmp(offset={offset}, target={target})")
                i += 2
            else:
                print(f"  [{i:3d}] cond_jmp ???")
                i += 1
        elif op == 0x0b:  # jmp_fwd
            if i+1 < len(all_dwords):
                offset = all_dwords[i+1]
                if offset >= 0x80000000:
                    offset -= 0x100000000
                target = i + 1 + offset
                print(f"  [{i:3d}] jmp_fwd(offset={offset}, target={target})")
                i += 2
            else:
                print(f"  [{i:3d}] jmp_fwd ???")
                i += 1
        elif op == 0x1b:  # jmp_back
            if i+1 < len(all_dwords):
                offset = all_dwords[i+1]
                if offset >= 0x80000000:
                    offset -= 0x100000000
                target = i + 1 - offset
                print(f"  [{i:3d}] jmp_back(offset={offset}, target={target})")
                i += 2
            else:
                print(f"  [{i:3d}] jmp_back ???")
                i += 1
        elif op == 0x1c:
            print(f"  [{i:3d}] halt")
            i += 1
        else:
            print(f"  [{i:3d}] {name}")
            i += 1

print("=== BYTECODE DISASSEMBLY ===")
disasm_bytecodes()
