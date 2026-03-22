#!/usr/bin/env python3
"""
VVM Challenge - Full VM Emulator
Emulates the custom virtual machine to trace password validation.
"""

import struct
import sys
import ctypes

BINARY = "/workspace/vvm_challenge/rev_vvm/vvm"

with open(BINARY, "rb") as f:
    binary = f.read()

# Parse ELF to get .data section
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

# Extract bytecode as array of 32-bit integers
BC_START_VA = 0x5540
bc_file_offset = BC_START_VA - data_addr
all_dwords = []
pos = bc_file_offset
while pos + 4 <= len(data_section):
    val = struct.unpack_from('<I', data_section, pos)[0]
    all_dwords.append(val)
    pos += 4

def s32(v):
    """Convert unsigned 32-bit to signed."""
    if v >= 0x80000000:
        return v - 0x100000000
    return v

def s64(v):
    """Convert to signed 64-bit."""
    v = v & 0xFFFFFFFFFFFFFFFF
    if v >= 0x8000000000000000:
        return v - 0x10000000000000000
    return v

class VM:
    def __init__(self, bytecode, input_str=""):
        self.bc = bytecode
        self.stack = [0] * 1024
        self.sp = 0  # stack depth (number of elements)
        self.pc = 0  # index into bytecode array
        self.input_str = input_str
        self.input_pos = 0
        self.output = ""
        self.strings = {}  # addr -> string (simulated memory)
        self.next_addr = 0x10000
        self.trace = []
        self.call_depth = 0
        self.halted = False

    def alloc_string(self, s):
        addr = self.next_addr
        self.strings[addr] = s
        self.next_addr += len(s) + 1
        return addr

    def get_string(self, addr):
        return self.strings.get(addr, "")

    def push(self, val):
        self.stack[self.sp] = val & 0xFFFFFFFFFFFFFFFF
        self.sp += 1

    def pop(self):
        self.sp -= 1
        return s64(self.stack[self.sp])

    def top(self):
        return s64(self.stack[self.sp - 1])

    def set_top(self, val):
        self.stack[self.sp - 1] = val & 0xFFFFFFFFFFFFFFFF

    def read_bc(self):
        """Read next dword from bytecode and advance PC."""
        val = self.bc[self.pc]
        self.pc += 1
        return val

    def run(self, max_steps=100000, trace=False):
        """Run the main loop. First opcode at bc[0], PC starts at 1."""
        opcode = self.bc[0]
        self.pc = 1

        steps = 0
        while opcode != 0x1c and steps < max_steps:
            if trace:
                indent = "  " * self.call_depth
                self.trace.append(f"{indent}[{steps}] pc={self.pc-1} op={opcode:#04x} sp={self.sp} stack={[s64(self.stack[i]) for i in range(min(self.sp, 10))]}")

            self.exec_opcode(opcode)
            steps += 1

            if self.halted:
                break

            # Main loop: read next opcode from PC, advance PC
            opcode = self.bc[self.pc]
            self.pc += 1

        if trace:
            print(f"VM finished after {steps} steps")
        return self.output

    def run_sub(self, start_pc, trace=False):
        """Run a sub-VM starting at given PC."""
        saved_pc = self.pc
        self.pc = start_pc

        opcode = self.bc[self.pc]
        self.pc += 1

        steps = 0
        while opcode != 0x1c and steps < 100000:
            if trace:
                indent = "  " * self.call_depth
                self.trace.append(f"{indent}  SUB [{steps}] pc={self.pc-1} op={opcode:#04x} sp={self.sp}")

            self.exec_opcode(opcode)
            steps += 1

            opcode = self.bc[self.pc]
            self.pc += 1

        # Restore PC to saved (but main run_sub caller handles this)
        self.pc = saved_pc

    def exec_opcode(self, op):
        if op == 0x00:  # strlen
            addr = self.top()
            s = self.get_string(addr)
            self.set_top(len(s))

        elif op == 0x01:  # shl
            a = self.pop() & 0xFF
            b = self.pop()
            result = (b << a) & 0xFFFFFFFF
            self.push(result)

        elif op == 0x02:  # mod
            a = self.pop()
            b = self.pop()
            if a != 0:
                # signed division
                sb = s64(b & 0xFFFFFFFFFFFFFFFF)
                sa = s64(a & 0xFFFFFFFFFFFFFFFF)
                # x86 idiv: remainder has same sign as dividend
                if sb < 0:
                    result = -((-sb) % abs(sa))
                else:
                    result = sb % abs(sa) if sa != 0 else 0
                self.push(result)
            else:
                self.push(0)

        elif op == 0x03:  # input (getline)
            buf_size = self.read_bc()  # read buffer size from bytecode
            # Read from simulated input
            end = self.input_str.find('\n', self.input_pos)
            if end == -1:
                line = self.input_str[self.input_pos:]
                self.input_pos = len(self.input_str)
            else:
                line = self.input_str[self.input_pos:end+1]
                self.input_pos = end + 1
            addr = self.alloc_string(line)
            self.push(addr)

        elif op == 0x04:  # div (signed)
            a = self.pop()
            b = self.pop()
            if a != 0:
                sb = s64(b & 0xFFFFFFFFFFFFFFFF)
                sa = s64(a & 0xFFFFFFFFFFFFFFFF)
                # Python integer division is floor division; C is truncation
                q = int(sb / sa) if sa != 0 else 0
                self.push(q)
            else:
                self.push(0)

        elif op == 0x05:  # add
            a = self.pop()
            b = self.pop()
            self.push(b + a)

        elif op == 0x06:  # mul
            a = self.pop()
            b = self.pop()
            self.push(b * a)

        elif op == 0x07:  # ptrace check (no-op)
            pass

        elif op == 0x08:  # or (32-bit)
            a = self.pop()
            b = self.pop()
            result = (int(b) | int(a)) & 0xFFFFFFFF
            self.push(result)

        elif op == 0x09:  # (val + 17) % 3
            val = self.top()
            result = (val + 17) % 3
            self.set_top(result)

        elif op == 0x0a:  # print
            addr = self.pop()
            s = self.get_string(addr)
            self.output += s
            # Free the string
            if addr in self.strings:
                del self.strings[addr]

        elif op == 0x0b:  # jump relative forward
            offset = s32(self.read_bc())
            # PC currently points after the offset. Jump: PC += offset - 1
            # Actually: handler reads offset from PC, sets PC = PC_of_offset + offset*4/4 = PC_of_offset + offset
            # Since we already read the offset (PC advanced past it), we need: PC = (pc_before_read) + offset
            # pc_before_read = self.pc - 1, so target = self.pc - 1 + offset
            self.pc = self.pc - 1 + offset

        elif op == 0x0c:  # 6*val - 12
            val = self.top()
            result = 6 * val - 12
            self.set_top(result)

        elif op == 0x0d:  # strip newline
            addr = self.top()
            s = self.get_string(addr)
            s = s.rstrip('\n')
            self.strings[addr] = s

        elif op == 0x0e:  # pop/discard (set top to 0, sp--)
            self.stack[self.sp - 1] = 0
            self.sp -= 1

        elif op == 0x0f:  # pack_string
            count = s32(self.read_bc())
            # Takes 'count' values from stack, creates a string from their low bytes
            chars = []
            start_idx = self.sp - count
            for i in range(count):
                val = self.stack[start_idx + i] & 0xFF
                chars.append(chr(val))
            result_str = ''.join(chars)
            # Replace the N values with one string pointer
            addr = self.alloc_string(result_str)
            self.stack[start_idx] = addr
            self.sp = start_idx + 1

        elif op == 0x10:  # dup_at (copy from depth)
            index = s32(self.read_bc())
            # Copies stack[depth-1-index] to stack[depth], depth++
            val = self.stack[self.sp - 1 - index]
            self.push(val)

        elif op == 0x11:  # call function
            offset = s32(self.read_bc())  # offset in dwords from bytecode start
            argc = s32(self.read_bc())   # number of arguments

            # Save current PC
            saved_pc = self.pc

            # Run sub-VM at the given offset
            self.call_depth += 1
            self.run_sub(offset, trace=False)
            self.call_depth -= 1

            # Get return value (top of stack)
            ret_val = self.stack[self.sp - 1]
            # Remove argc entries + 1 (return value)
            self.sp = self.sp - 1 - argc
            self.stack[self.sp] = ret_val
            self.sp += 1

            # Restore PC
            self.pc = saved_pc

        elif op == 0x12:  # char_at (index into string)
            index = s32(self.read_bc())
            addr = self.top()
            s = self.get_string(addr)
            if 0 <= index < len(s):
                # Sign-extended byte
                ch = ord(s[index])
                if ch >= 128:
                    ch -= 256
                self.set_top(ch)
            else:
                self.set_top(0)

        elif op == 0x13:  # equal
            a = self.pop()
            b = self.pop()
            self.push(1 if b == a else 0)

        elif op == 0x14:  # not_equal
            a = self.pop()
            b = self.pop()
            self.push(1 if b != a else 0)

        elif op == 0x15:  # val * 8 + 24
            val = self.top()
            self.set_top(val * 8 + 24)

        elif op == 0x16:  # conditional jump
            offset = s32(self.read_bc())
            cond = self.pop()
            if cond != 0:
                # Jump: add offset to PC (PC is past the offset already)
                self.pc = self.pc - 1 + offset

        elif op == 0x17:  # dup top
            val = self.stack[self.sp - 1]
            self.push(val)

        elif op == 0x18:  # sub
            a = self.pop()
            b = self.pop()
            self.push(b - a)

        elif op == 0x19:  # push immediate
            imm = s32(self.read_bc())
            self.push(imm)

        elif op == 0x1a:  # shr (logical)
            a = self.pop() & 0xFF
            b = self.pop() & 0xFFFFFFFF
            result = b >> a
            self.push(result)

        elif op == 0x1b:  # jump backward
            offset = s32(self.read_bc())
            # PC was at the offset position, now past it.
            # Handler: PC = PC_of_offset - offset
            self.pc = self.pc - 1 - offset

        else:
            print(f"Unknown opcode: {op:#x}")
            self.halted = True


# Test with "AAAA"
print("=" * 60)
print("Testing with input 'AAAA'")
print("=" * 60)
vm = VM(all_dwords, "AAAA\n")
output = vm.run(max_steps=200000, trace=False)
print(f"Output: {repr(output)}")

# Now let's trace to understand the validation
print("\n" + "=" * 60)
print("Tracing with 'AAAA' to understand validation")
print("=" * 60)
vm = VM(all_dwords, "AAAA\n")
output = vm.run(max_steps=200000, trace=True)
for line in vm.trace[:100]:
    print(line)
print(f"... ({len(vm.trace)} total trace lines)")
print(f"Output: {repr(output)}")
