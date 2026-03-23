"""Páginas 40-42: Regalo de los Blobitos, Capítulo 10 - El regreso, nostalgia."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import *
from reportlab.pdfgen import canvas
import random, math

def crear(ruta):
    c = canvas.Canvas(ruta, pagesize=A4)

    # === PÁGINA 40: Regalo de los Blobitos ===
    fondo_espacio_seed(c, 4040, HexColor("#1A0040"))

    # Planeta rosa abajo
    c.setFillColor(ROSA_NEBULOSA)
    c.circle(W/2, -100, 250, fill=1, stroke=0)

    # Luna recibiendo un regalo
    dibujar_luna_gata(c, W/2 - 50, H/2, escala=1.5, casco=True)

    # Blobito dando regalo
    bx, by = W/2 + 80, H/2
    c.setFillColor(HexColor("#7C4DFF"))
    c.ellipse(bx - 20, by - 15, bx + 20, by + 15, fill=1, stroke=1)
    c.setFillColor(white)
    c.circle(bx - 7, by + 5, 6, fill=1, stroke=0)
    c.circle(bx + 7, by + 5, 6, fill=1, stroke=0)
    c.setFillColor(black)
    c.circle(bx - 7, by + 5, 3, fill=1, stroke=0)
    c.circle(bx + 7, by + 5, 3, fill=1, stroke=0)

    # Objeto regalo (esfera brillante)
    gx, gy = W/2 + 20, H/2 + 30
    c.setFillColor(HexColor("#FFD70060"))
    c.circle(gx, gy, 20, fill=1, stroke=0)
    c.setFillColor(AMARILLO_ESTRELLA)
    c.circle(gx, gy, 12, fill=1, stroke=0)
    c.setFillColor(white)
    c.circle(gx - 3, gy + 3, 3, fill=1, stroke=0)

    # Destellos
    for angle in range(0, 360, 45):
        x = gx + 25 * math.cos(math.radians(angle))
        y = gy + 25 * math.sin(math.radians(angle))
        c.setFillColor(AMARILLO_ESTRELLA)
        c.circle(x, y, 2, fill=1, stroke=0)

    texto_parrafo(c,
        "Los Blobitos le regalaron a Luna una Esfera de Luz Estelar: una bolita que "
        "brillaba con la luz de una estrella real. \"Cuando estés lejos de casa y te "
        "sientas sola, mírala y recuerda que tienes amigos en toda la galaxia.\" "
        "Luna la abrazó fuerte contra su pecho.",
        60, H - 50, W - 120, tamano=12, color=white)

    numero_pagina(c, 40)
    c.showPage()

    # === PÁGINA 41: Capítulo 10 - El regreso ===
    fondo_espacio_seed(c, 4141, AZUL_OSCURO)

    # Mapa de regreso (más simple, con flechas)
    c.setStrokeColor(AMARILLO_ESTRELLA)
    c.setLineWidth(2)
    c.setDash([8, 4])

    puntos = [
        (450, H - 150, "Galaxia Blobito"),
        (350, H - 250, "Nebulosa"),
        (250, H - 350, "Neptuno"),
        (200, H - 420, "Saturno"),
        (300, H - 490, "Júpiter"),
        (150, H - 560, "Marte"),
        (250, H - 630, "Tierra"),
    ]

    for i in range(len(puntos) - 1):
        c.line(puntos[i][0], puntos[i][1], puntos[i+1][0], puntos[i+1][1])

    c.setDash([])

    for x, y, nombre in puntos:
        c.setFillColor(AMARILLO_ESTRELLA)
        c.circle(x, y, 6, fill=1, stroke=1)
        c.setFont(FUENTE_TEXTO, 9)
        c.setFillColor(white)
        c.drawString(x + 10, y - 3, nombre)

    # Cohete en el camino
    dibujar_cohete(c, 300, H - 380, escala=0.6)

    c.setFillColor(AMARILLO_ESTRELLA)
    c.setFont(FUENTE_TITULO, 22)
    c.drawCentredString(W/2, H - 40, "Capítulo 10")
    c.setFont(FUENTE_TITULO, 16)
    c.drawCentredString(W/2, H - 65, "Hora de volver a casa")

    texto_parrafo(c,
        "Después de la aventura más increíble de su vida, Luna sabía que era hora "
        "de volver. Echaba de menos su pueblo, su casa, su ventana... "
        "\"Hogar, dulce hogar\", suspiró mientras programaba la ruta de regreso.",
        60, 120, W - 120, tamano=12, color=white)

    numero_pagina(c, 41)
    c.showPage()

    # === PÁGINA 42: Mirando fotos del viaje ===
    fondo_espacio_seed(c, 4242, AZUL_NOCHE)

    # Interior del cohete (simple)
    c.setFillColor(HexColor("#37474F"))
    c.roundRect(50, 50, W - 100, H - 200, 20, fill=1, stroke=1)

    # Pantalla mostrando fotos
    c.setFillColor(HexColor("#263238"))
    c.roundRect(100, 300, 380, 250, 10, fill=1, stroke=1)

    # Mini fotos en la pantalla
    fotos = [
        (120, 480, ROJO_MARTE, "Marte"),
        (230, 480, LILA_JUPITER, "Júpiter"),
        (340, 480, NARANJA_SATURNO, "Saturno"),
        (120, 370, AZUL_NEPTUNO, "Neptuno"),
        (230, 370, ROSA_NEBULOSA, "Nebulosa"),
        (340, 370, HexColor("#7C4DFF"), "Blobitos"),
    ]
    for fx, fy, color, nombre in fotos:
        c.setFillColor(color)
        c.roundRect(fx, fy, 90, 70, 5, fill=1, stroke=1)
        c.setFillColor(white)
        c.setFont(FUENTE_TEXTO, 8)
        c.drawCentredString(fx + 45, fy + 5, nombre)

    # Luna sentada mirando fotos
    dibujar_luna_gata(c, 200, 180, escala=1.2, casco=False, mirando="derecha")
    dibujar_zip_robot(c, 350, 170, escala=1.0)

    texto_parrafo(c,
        "Durante el viaje de regreso, Luna y Zip miraron todas las fotos que habían sacado. "
        "La Luna, Marte, los volcanes, Júpiter, Saturno, la nebulosa, los Blobitos... "
        "\"Hemos vivido una aventura increíble, ¿verdad Zip?\" \"¡Bip bip!\"",
        60, H - 60, W - 120, tamano=12, color=white)

    numero_pagina(c, 42)
    c.showPage()

    c.save()
    print(f"  ✓ Páginas 40-42 creadas: {ruta}")

if __name__ == "__main__":
    crear("../pdfs/pag_40_42.pdf")
