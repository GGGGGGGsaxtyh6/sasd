# Secure Password Database — picoCTF

## Flag

```
picoCTF{d0nt_trust_us3rs}
```

## Vulnerability

Heartbleed-style buffer over-read (`heartbleed.c`). The program allocates a 90-byte buffer, stores the user's password at offset 0, and a secret (obfuscated bytes XOR 0xAA) at offset 60. When the user specifies the "password length", the program prints that many bytes from the buffer — regardless of the actual password length. This leaks the secret stored beyond the password.

## Exploitation Steps

1. Connect to the service.
2. Enter a short password (e.g. `A`).
3. When asked for the length, enter `89` (max buffer size) to trigger the over-read.
4. The leaked bytes at offset 60 reveal the secret: `iUbh81!j*hn!` (decimal: `105 85 98 104 56 49 33 106 42 104 110 33`).
5. Compute the djb2 hash of the secret:
   - `hash = 5381`; for each byte `c`: `hash = hash * 33 + c` (64-bit)
   - Result: `15237662580160011234`
6. Submit the hash to authenticate and receive the flag.

## Key Details

- **Hash algorithm**: djb2 (initial value 0x1505 / 5381)
- **Obfuscation**: `obf_bytes` XOR `0xAA` produces the secret string
- **Buffer layout**: `[password (offset 0)] ... [secret (offset 60)] ... [end (offset 89)]`
