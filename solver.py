#!/usr/bin/env python3
"""
VVM Challenge Solver
Reverses the VM password validation to extract the flag.
"""

def rotl32(val, n):
    n = n % 32
    return ((val << n) | (val >> (32 - n))) & 0xFFFFFFFF

def rotr32(val, n):
    return rotl32(val, 32 - n)

# Target values from the VM bytecode comparisons
# rotl32(v0, 7)  should equal 0xb639b429
# rotl32(v1, 14) should equal 0x1517dd9c
# rotl32(v2, 20) should equal 0x47272423
# rotl32(v3, 12) should equal 0xf3444305
# rotl32(v4, 18) should equal 0xddbdd50d
# rotl32(v5, 7)  should equal 0xba3cbd99
# rotl32(v6, 19) should equal 0x8a73ea61
# rotl32(v7, 15) should equal 0x2a239824

targets = [
    (0xb639b429, 7),   # v0
    (0x1517dd9c, 14),  # v1
    (0x47272423, 20),  # v2
    (0xf3444305, 12),  # v3
    (0xddbdd50d, 18),  # v4
    (0xba3cbd99, 7),   # v5
    (0x8a73ea61, 19),  # v6
    (0x2a239824, 15),  # v7
]

# Reverse the rotations to get the original packed values
packed = []
for target_val, shift in targets:
    original = rotr32(target_val, shift)
    packed.append(original)
    print(f"  rotr32(0x{target_val:08x}, {shift:2d}) = 0x{original:08x}")

# Character index mapping for each packed value
# v[i] = str[a] | (str[b] << 8) | (str[c] << 16) | (str[d] << 24)
char_indices = [
    [24, 14, 27, 15],  # v0
    [11,  7, 12,  4],  # v1
    [ 6,  9,  2, 18],  # v2
    [19, 13, 20, 26],  # v3
    [28, 16, 23,  8],  # v4
    [ 3, 30, 21, 22],  # v5
    [25,  5, 10, 31],  # v6
    [29,  1,  0, 17],  # v7
]

# Extract characters
password = ['?'] * 32
for i, (v, indices) in enumerate(zip(packed, char_indices)):
    b0 = v & 0xFF
    b1 = (v >> 8) & 0xFF
    b2 = (v >> 16) & 0xFF
    b3 = (v >> 24) & 0xFF
    
    password[indices[0]] = chr(b0)
    password[indices[1]] = chr(b1)
    password[indices[2]] = chr(b2)
    password[indices[3]] = chr(b3)
    
    print(f"  v{i} = 0x{v:08x}: [{indices[0]}]='{chr(b0)}' [{indices[1]}]='{chr(b1)}' [{indices[2]}]='{chr(b2)}' [{indices[3]}]='{chr(b3)}'")

flag = ''.join(password)
print(f"\nPassword/Flag: {flag}")
