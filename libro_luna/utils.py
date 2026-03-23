"""
Utilidades compartidas para el libro "Las Aventuras de Luna la Gata Espacial"
"""
import math
import random
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import (
    HexColor, white, black, yellow, orange, red, blue,
    green, purple, pink, gray, lightgrey
)
from reportlab.pdfgen import canvas

W, H = A4
FUENTE_TITULO = "Helvetica-Bold"
FUENTE_TEXTO = "Helvetica"
FUENTE_ITALIC = "Helvetica-Oblique"

# Paleta de colores bonitos
AZUL_ESPACIO = HexColor("#0B1354")
AZUL_OSCURO = HexColor("#1B2A5E")
AZUL_NOCHE = HexColor("#162047")
MORADO_ESPACIO = HexColor("#2D1B69")
NARANJA_SOL = HexColor("#FF8C42")
AMARILLO_ESTRELLA = HexColor("#FFD700")
ROSA_NEBULOSA = HexColor("#FF69B4")
VERDE_ALIEN = HexColor("#39FF14")
ROJO_MARTE = HexColor("#C1440E")
ARENA_MARTE = HexColor("#E77D11")
CYAN_HIELO = HexColor("#00E5FF")
GRIS_LUNA_GATA = HexColor("#A0A0A0")
BLANCO_PANZA = HexColor("#E8E8E8")
ROSA_NARIZ = HexColor("#FF9999")
VERDE_OJOS = HexColor("#4CAF50")
NARANJA_SATURNO = HexColor("#E8A038")
LILA_JUPITER = HexColor("#9C6ADE")
AZUL_NEPTUNO = HexColor("#1E88E5")
VERDE_PLANETA = HexColor("#43A047")


def fondo_espacio(c, color_base=None):
    """Pinta un fondo de espacio estrellado."""
    if color_base is None:
        color_base = AZUL_ESPACIO
    c.setFillColor(color_base)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    random.seed(42)
    for _ in range(80):
        x = random.uniform(10, W - 10)
        y = random.uniform(10, H - 10)
        r = random.uniform(0.5, 2.5)
        brillo = random.uniform(0.6, 1.0)
        c.setFillColor(HexColor(f"#{int(brillo*255):02x}{int(brillo*255):02x}{int(brillo*240):02x}"))
        c.circle(x, y, r, fill=1, stroke=0)


def fondo_espacio_seed(c, seed, color_base=None):
    """Fondo de espacio con seed diferente para variación."""
    if color_base is None:
        color_base = AZUL_ESPACIO
    c.setFillColor(color_base)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    random.seed(seed)
    for _ in range(90):
        x = random.uniform(10, W - 10)
        y = random.uniform(10, H - 10)
        r = random.uniform(0.5, 2.8)
        brillo = random.uniform(0.5, 1.0)
        c.setFillColor(HexColor(f"#{int(brillo*255):02x}{int(brillo*255):02x}{int(brillo*240):02x}"))
        c.circle(x, y, r, fill=1, stroke=0)


def dibujar_luna_gata(c, cx, cy, escala=1.0, mirando="derecha", casco=True):
    """Dibuja a Luna, la gata protagonista."""
    s = escala
    flip = 1 if mirando == "derecha" else -1

    if casco:
        c.setFillColor(HexColor("#FFFFFF20"))
        c.setStrokeColor(HexColor("#88CCFF"))
        c.setLineWidth(2 * s)
        c.circle(cx, cy + 20 * s, 30 * s, fill=1, stroke=1)

    # Cuerpo
    c.setFillColor(GRIS_LUNA_GATA)
    c.setStrokeColor(black)
    c.setLineWidth(1.5 * s)
    c.ellipse(cx - 18 * s, cy - 30 * s, cx + 18 * s, cy + 5 * s, fill=1, stroke=1)

    # Panza
    c.setFillColor(BLANCO_PANZA)
    c.ellipse(cx - 10 * s, cy - 25 * s, cx + 10 * s, cy + 0 * s, fill=1, stroke=0)

    # Cabeza
    c.setFillColor(GRIS_LUNA_GATA)
    c.setStrokeColor(black)
    c.circle(cx, cy + 20 * s, 18 * s, fill=1, stroke=1)

    # Orejas
    p = c.beginPath()
    p.moveTo(cx - 14 * s, cy + 33 * s)
    p.lineTo(cx - 8 * s * flip, cy + 50 * s)
    p.lineTo(cx - 4 * s, cy + 33 * s)
    p.close()
    c.setFillColor(GRIS_LUNA_GATA)
    c.drawPath(p, fill=1, stroke=1)

    p2 = c.beginPath()
    p2.moveTo(cx + 4 * s, cy + 33 * s)
    p2.lineTo(cx + 8 * s * flip, cy + 50 * s)
    p2.lineTo(cx + 14 * s, cy + 33 * s)
    p2.close()
    c.drawPath(p2, fill=1, stroke=1)

    # Interior orejas
    c.setFillColor(ROSA_NARIZ)
    p3 = c.beginPath()
    p3.moveTo(cx - 12 * s, cy + 34 * s)
    p3.lineTo(cx - 8 * s * flip, cy + 46 * s)
    p3.lineTo(cx - 6 * s, cy + 34 * s)
    p3.close()
    c.drawPath(p3, fill=1, stroke=0)

    p4 = c.beginPath()
    p4.moveTo(cx + 6 * s, cy + 34 * s)
    p4.lineTo(cx + 8 * s * flip, cy + 46 * s)
    p4.lineTo(cx + 12 * s, cy + 34 * s)
    p4.close()
    c.drawPath(p4, fill=1, stroke=0)

    # Ojos
    c.setFillColor(white)
    c.ellipse(cx - 11 * s, cy + 16 * s, cx - 3 * s, cy + 28 * s, fill=1, stroke=1)
    c.ellipse(cx + 3 * s, cy + 16 * s, cx + 11 * s, cy + 28 * s, fill=1, stroke=1)

    c.setFillColor(VERDE_OJOS)
    ox = 2 * s * flip
    c.circle(cx - 7 * s + ox, cy + 22 * s, 3.5 * s, fill=1, stroke=0)
    c.circle(cx + 7 * s + ox, cy + 22 * s, 3.5 * s, fill=1, stroke=0)

    c.setFillColor(black)
    c.circle(cx - 7 * s + ox, cy + 22 * s, 2 * s, fill=1, stroke=0)
    c.circle(cx + 7 * s + ox, cy + 22 * s, 2 * s, fill=1, stroke=0)

    # Brillos en los ojos
    c.setFillColor(white)
    c.circle(cx - 6 * s + ox, cy + 24 * s, 1 * s, fill=1, stroke=0)
    c.circle(cx + 8 * s + ox, cy + 24 * s, 1 * s, fill=1, stroke=0)

    # Nariz
    c.setFillColor(ROSA_NARIZ)
    p5 = c.beginPath()
    p5.moveTo(cx, cy + 17 * s)
    p5.lineTo(cx - 2.5 * s, cy + 14 * s)
    p5.lineTo(cx + 2.5 * s, cy + 14 * s)
    p5.close()
    c.drawPath(p5, fill=1, stroke=0)

    # Boca sonriente
    c.setStrokeColor(black)
    c.setLineWidth(1 * s)
    p6 = c.beginPath()
    p6.moveTo(cx - 5 * s, cy + 12 * s)
    p6.curveTo(cx - 3 * s, cy + 8 * s, cx + 3 * s, cy + 8 * s, cx + 5 * s, cy + 12 * s)
    c.drawPath(p6, fill=0, stroke=1)

    # Bigotes
    c.setLineWidth(0.8 * s)
    for dy in [0, 3]:
        c.line(cx - 16 * s, cy + (15 + dy) * s, cx - 26 * s, cy + (17 + dy) * s)
        c.line(cx + 16 * s, cy + (15 + dy) * s, cx + 26 * s, cy + (17 + dy) * s)

    # Cola
    c.setStrokeColor(GRIS_LUNA_GATA)
    c.setLineWidth(4 * s)
    p7 = c.beginPath()
    tail_x = cx + 18 * s * flip
    p7.moveTo(tail_x, cy - 20 * s)
    p7.curveTo(tail_x + 15 * s * flip, cy - 15 * s, tail_x + 20 * s * flip, cy, tail_x + 12 * s * flip, cy + 10 * s)
    c.drawPath(p7, fill=0, stroke=1)

    # Patitas
    c.setFillColor(GRIS_LUNA_GATA)
    c.setStrokeColor(black)
    c.setLineWidth(1 * s)
    c.ellipse(cx - 16 * s, cy - 35 * s, cx - 6 * s, cy - 27 * s, fill=1, stroke=1)
    c.ellipse(cx + 6 * s, cy - 35 * s, cx + 16 * s, cy - 27 * s, fill=1, stroke=1)


def dibujar_estrella(c, cx, cy, radio, color=AMARILLO_ESTRELLA, puntas=5):
    """Dibuja una estrella."""
    c.setFillColor(color)
    c.setStrokeColor(black)
    c.setLineWidth(0.5)
    p = c.beginPath()
    for i in range(puntas * 2):
        angle = math.pi / 2 + i * math.pi / puntas
        r = radio if i % 2 == 0 else radio * 0.4
        x = cx + r * math.cos(angle)
        y = cy + r * math.sin(angle)
        if i == 0:
            p.moveTo(x, y)
        else:
            p.lineTo(x, y)
    p.close()
    c.drawPath(p, fill=1, stroke=1)


def dibujar_planeta(c, cx, cy, radio, color1, color2=None, anillos=False):
    """Dibuja un planeta con opciones de anillos."""
    if anillos:
        c.setStrokeColor(color2 or AMARILLO_ESTRELLA)
        c.setLineWidth(3)
        c.ellipse(cx - radio * 1.8, cy - radio * 0.3, cx + radio * 1.8, cy + radio * 0.3, fill=0, stroke=1)

    c.setFillColor(color1)
    c.setStrokeColor(black)
    c.setLineWidth(1)
    c.circle(cx, cy, radio, fill=1, stroke=1)

    if color2 and not anillos:
        c.setFillColor(color2)
        c.setLineWidth(0)
        c.ellipse(cx - radio * 0.7, cy + radio * 0.1, cx + radio * 0.3, cy + radio * 0.5, fill=1, stroke=0)

    if anillos:
        c.setStrokeColor(color2 or AMARILLO_ESTRELLA)
        c.setLineWidth(2.5)
        c.setDash([])
        p = c.beginPath()
        p.moveTo(cx - radio * 1.8, cy)
        p.curveTo(cx - radio * 1.5, cy + radio * 0.4, cx + radio * 1.5, cy + radio * 0.4, cx + radio * 1.8, cy)
        c.drawPath(p, fill=0, stroke=1)


def dibujar_cohete(c, cx, cy, escala=1.0):
    """Dibuja un cohete espacial."""
    s = escala
    # Cuerpo
    c.setFillColor(white)
    c.setStrokeColor(black)
    c.setLineWidth(1.5 * s)
    c.roundRect(cx - 15 * s, cy - 40 * s, 30 * s, 70 * s, 10 * s, fill=1, stroke=1)

    # Ventana
    c.setFillColor(CYAN_HIELO)
    c.circle(cx, cy + 5 * s, 10 * s, fill=1, stroke=1)
    c.setFillColor(HexColor("#FFFFFF80"))
    c.circle(cx - 3 * s, cy + 8 * s, 3 * s, fill=1, stroke=0)

    # Punta
    c.setFillColor(red)
    p = c.beginPath()
    p.moveTo(cx - 15 * s, cy + 30 * s)
    p.lineTo(cx, cy + 55 * s)
    p.lineTo(cx + 15 * s, cy + 30 * s)
    p.close()
    c.drawPath(p, fill=1, stroke=1)

    # Aletas
    c.setFillColor(red)
    p2 = c.beginPath()
    p2.moveTo(cx - 15 * s, cy - 30 * s)
    p2.lineTo(cx - 28 * s, cy - 45 * s)
    p2.lineTo(cx - 15 * s, cy - 10 * s)
    p2.close()
    c.drawPath(p2, fill=1, stroke=1)

    p3 = c.beginPath()
    p3.moveTo(cx + 15 * s, cy - 30 * s)
    p3.lineTo(cx + 28 * s, cy - 45 * s)
    p3.lineTo(cx + 15 * s, cy - 10 * s)
    p3.close()
    c.drawPath(p3, fill=1, stroke=1)

    # Fuego
    for i, clr in enumerate([NARANJA_SOL, AMARILLO_ESTRELLA, red]):
        c.setFillColor(clr)
        fw = (12 - i * 3) * s
        fh = (20 + i * 5) * s
        p4 = c.beginPath()
        p4.moveTo(cx - fw, cy - 40 * s)
        p4.curveTo(cx - fw * 0.5, cy - 40 * s - fh, cx + fw * 0.5, cy - 40 * s - fh, cx + fw, cy - 40 * s)
        p4.close()
        c.drawPath(p4, fill=1, stroke=0)


def dibujar_zip_robot(c, cx, cy, escala=1.0):
    """Dibuja a Zip, el robot amigo."""
    s = escala
    # Cuerpo
    c.setFillColor(HexColor("#B0BEC5"))
    c.setStrokeColor(black)
    c.setLineWidth(1.5 * s)
    c.roundRect(cx - 14 * s, cy - 20 * s, 28 * s, 35 * s, 5 * s, fill=1, stroke=1)

    # Cabeza
    c.setFillColor(HexColor("#90A4AE"))
    c.roundRect(cx - 16 * s, cy + 18 * s, 32 * s, 24 * s, 8 * s, fill=1, stroke=1)

    # Antena
    c.setStrokeColor(black)
    c.setLineWidth(2 * s)
    c.line(cx, cy + 42 * s, cx, cy + 52 * s)
    c.setFillColor(VERDE_ALIEN)
    c.circle(cx, cy + 54 * s, 3 * s, fill=1, stroke=1)

    # Ojos LED
    c.setFillColor(CYAN_HIELO)
    c.roundRect(cx - 10 * s, cy + 26 * s, 8 * s, 8 * s, 2 * s, fill=1, stroke=1)
    c.roundRect(cx + 2 * s, cy + 26 * s, 8 * s, 8 * s, 2 * s, fill=1, stroke=1)

    # Boca (pantallita)
    c.setFillColor(VERDE_ALIEN)
    c.roundRect(cx - 8 * s, cy + 20 * s, 16 * s, 4 * s, 1 * s, fill=1, stroke=0)

    # Brazos
    c.setFillColor(HexColor("#78909C"))
    c.roundRect(cx - 22 * s, cy - 10 * s, 6 * s, 25 * s, 3 * s, fill=1, stroke=1)
    c.roundRect(cx + 16 * s, cy - 10 * s, 6 * s, 25 * s, 3 * s, fill=1, stroke=1)

    # Piernas
    c.roundRect(cx - 10 * s, cy - 30 * s, 8 * s, 12 * s, 3 * s, fill=1, stroke=1)
    c.roundRect(cx + 2 * s, cy - 30 * s, 8 * s, 12 * s, 3 * s, fill=1, stroke=1)


def texto_centrado(c, texto, y, tamano=24, color=white, fuente=FUENTE_TITULO):
    """Escribe texto centrado."""
    c.setFillColor(color)
    c.setFont(fuente, tamano)
    c.drawCentredString(W / 2, y, texto)


def texto_parrafo(c, texto, x, y, ancho, tamano=14, color=white, fuente=FUENTE_TEXTO, interlinea=1.4):
    """Escribe un párrafo con saltos de línea automáticos."""
    c.setFillColor(color)
    c.setFont(fuente, tamano)
    palabras = texto.split()
    lineas = []
    linea_actual = ""
    for palabra in palabras:
        test = linea_actual + " " + palabra if linea_actual else palabra
        if c.stringWidth(test, fuente, tamano) <= ancho:
            linea_actual = test
        else:
            lineas.append(linea_actual)
            linea_actual = palabra
    if linea_actual:
        lineas.append(linea_actual)

    for i, linea in enumerate(lineas):
        c.drawString(x, y - i * tamano * interlinea, linea)
    return y - len(lineas) * tamano * interlinea


def numero_pagina(c, num):
    """Pone número de página abajo."""
    c.setFillColor(HexColor("#FFFFFF80"))
    c.setFont(FUENTE_TEXTO, 9)
    c.drawCentredString(W / 2, 20, f"— {num} —")
