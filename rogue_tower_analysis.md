# Rogue Tower - Análisis de Tráfico de Red (picoCTF)

## Flag

```
picoCTF{r0gu3_c3ll_t0w3r_3b588aa7}
```

## Resumen

Una torre celular sospechosa fue detectada en la red. Se analizó el tráfico capturado en `rogue_tower.pcap` para identificar la torre rogue, el dispositivo comprometido, y recuperar la flag exfiltrada.

## Análisis Detallado

### 1. Torres Legítimas (Paquetes 1-2)

Broadcasts UDP en puerto 55000 desde `192.168.1.1` (torre legítima):

| Carrier | PLMN   | CELLID |
|---------|--------|--------|
| Verizon | 310410 | 23747  |
| AT&T    | 310410 | 23748  |

### 2. Torre Rogue Identificada (Paquete 14)

Broadcast UDP en puerto 55000 desde **`192.168.99.1`** (torre rogue):

```
UNAUTHORIZED-TEST-NETWORK PLMN=00101 CELLID=97320
```

Indicadores de torre rogue:
- IP diferente a las torres legítimas (`192.168.99.1` vs `192.168.1.1`)
- PLMN de prueba (`00101`) en lugar del PLMN real (`310410`)
- Se identifica como `UNAUTHORIZED-TEST-NETWORK`

### 3. Dispositivo Comprometido

El dispositivo con IMSI `310410176578566` (IP: `10.100.163.232`) se conectó a la torre rogue y comenzó a exfiltrar datos:

- **Paquete 15**: Consulta DNS para `device-310410176578566.network.com`
- **Paquete 16**: Registro con servidor C2 en `198.51.100.225` (diferente al servidor legítimo `198.51.100.214`)
- **Paquetes 17-22**: 6 peticiones POST a `/upload` en `198.51.100.225:443` (HTTP no cifrado sobre puerto HTTPS)

### 4. Extracción de Datos Exfiltrados

Los 6 POST `/upload` contenían fragmentos de datos en base64:

| Paquete | Puerto Src | Datos           |
|---------|-----------|-----------------|
| 17      | 50000     | `R19WWHthc`     |
| 18      | 50001     | `E1FBlJCC2`     |
| 19      | 50002     | `pVBVtaakM`     |
| 20      | 50003     | `IQgVEaAVX`     |
| 21      | 50004     | `AgANV1cAS`     |
| 22      | 50005     | `w==`           |

### 5. Decodificación

1. **Concatenar fragmentos base64**: `R19WWHthcE1FBlJCC2pVBVtaakMIQgVEaAVXAgANV1cASw==`
2. **Decodificar base64**: Produce bytes cifrados con XOR
3. **Clave XOR**: Los últimos 8 dígitos del IMSI del dispositivo comprometido: `76578566`
4. **Descifrar XOR**: Aplicar XOR cíclico con la clave para obtener la flag

```python
import base64

chunks = ['R19WWHthc', 'E1FBlJCC2', 'pVBVtaakM', 'IQgVEaAVX', 'AgANV1cAS', 'w==']
combined = ''.join(chunks)
decoded = base64.b64decode(combined)
key = b'76578566'
flag = bytes([decoded[i] ^ key[i % len(key)] for i in range(len(decoded))])
print(flag.decode())  # picoCTF{r0gu3_c3ll_t0w3r_3b588aa7}
```

## Dispositivos en la Red

| IMSI              | IP             | Comportamiento                  |
|-------------------|----------------|---------------------------------|
| 310410198752684   | 10.100.57.198  | Normal - registro con 198.51.100.214 |
| 310410485441371   | 10.100.111.18  | Normal - registro con 198.51.100.214 |
| 310410361987602   | 10.100.149.233 | Normal - registro con 198.51.100.214 |
| 310410215364702   | 10.100.71.179  | Normal - registro con 198.51.100.214 |
| **310410176578566** | **10.100.163.232** | **Comprometido** - conectado a torre rogue, exfiltra datos a 198.51.100.225 |

## Herramientas Utilizadas

- `tshark` para análisis de paquetes
- Python para decodificación base64 y descifrado XOR
