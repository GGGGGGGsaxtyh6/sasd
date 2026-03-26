#!/usr/bin/env python3
"""
Solución para Hidden Cipher 1 - picoCTF
Autor del reto: Yahaya Meddy

Pasos:
1. Desempaquetar el binario con UPX: upx -d hiddencipher
2. Análisis estático: la función get_secret() construye la clave "S3Cr3t" byte a byte
3. El programa lee flag.txt, aplica XOR con la clave (cíclicamente) y lo imprime en hex
4. Para descifrar: tomar la salida hex del servidor, XOR con la misma clave

Flag: picoCTF{xor_unpack_4nalys1s_78c0e704}
"""

import socket

def get_encrypted_flag(host: str, port: int) -> str:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(10)
        s.connect((host, port))
        data = b""
        while True:
            try:
                chunk = s.recv(4096)
                if not chunk:
                    break
                data += chunk
            except socket.timeout:
                break
    text = data.decode()
    for line in text.strip().split("\n"):
        line = line.strip()
        if line and all(c in "0123456789abcdef" for c in line):
            return line
    return ""

def decrypt_xor(hex_data: str, key: str) -> str:
    encrypted = bytes.fromhex(hex_data)
    return "".join(chr(b ^ ord(key[i % len(key)])) for i, b in enumerate(encrypted))

if __name__ == "__main__":
    HOST = "candy-mountain.picoctf.net"
    PORT = 65120
    KEY = "S3Cr3t"

    print("[*] Conectando al servidor...")
    encrypted_hex = get_encrypted_flag(HOST, PORT)
    print(f"[*] Flag cifrada (hex): {encrypted_hex}")

    flag = decrypt_xor(encrypted_hex, KEY)
    print(f"[+] Flag: {flag}")
