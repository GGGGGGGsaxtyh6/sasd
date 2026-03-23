"""Páginas 13-15: Luna y Zip despegan juntos, viaje por el espacio, llegada a Marte."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import *
from reportlab.pdfgen import canvas
import random

def crear(ruta):
    c = canvas.Canvas(ruta, pagesize=A4)

    # === PÁGINA 13: Despegan juntos ===
    fondo_espacio_seed(c, 1313, AZUL_ESPACIO)

    # Luna grande (satélite) alejándose
    c.setFillColor(HexColor("#E0E0E0"))
    c.circle(W/2, -100, 200, fill=1, stroke=0)
    c.setFillColor(HexColor("#BDBDBD"))
    c.circle(W/2 - 50, -30, 30, fill=1, stroke=0)
    c.circle(W/2 + 60, -60, 20, fill=1, stroke=0)

    # Cohete
    dibujar_cohete(c, W/2, H/2 + 50, escala=2.0)

    # Luna y Zip visibles en ventana
    c.setFillColor(GRIS_LUNA_GATA)
    c.circle(W/2 - 5, H/2 + 60, 5, fill=1, stroke=0)
    c.setFillColor(HexColor("#B0BEC5"))
    c.circle(W/2 + 5, H/2 + 55, 4, fill=1, stroke=0)

    # Texto
    texto_parrafo(c,
        "Con Zip a bordo, Luna reprogramó el cohete para la siguiente parada: ¡Marte! "
        "\"¡Bip bip biiiip!\" decía Zip emocionado. Luna sonreía. "
        "Tener un amigo hacía el viaje mucho mejor.",
        60, H - 50, W - 120, tamano=13, color=white)

    # Flecha señalando dirección
    c.setStrokeColor(AMARILLO_ESTRELLA)
    c.setLineWidth(3)
    c.line(W/2 + 60, H - 150, W/2 + 120, H - 120)
    c.setFillColor(AMARILLO_ESTRELLA)
    c.setFont(FUENTE_TITULO, 12)
    c.drawString(W/2 + 125, H - 125, "→ ¡A Marte!")

    numero_pagina(c, 13)
    c.showPage()

    # === PÁGINA 14: Viaje por el espacio ===
    fondo_espacio_seed(c, 1414, MORADO_ESPACIO)

    # Nebulosa de colores
    for i in range(5):
        random.seed(1414 + i)
        cx = random.uniform(50, W - 50)
        cy = random.uniform(200, H - 100)
        c.setFillColor(HexColor(f"#FF69B4{30 + i*10:02x}"))
        c.circle(cx, cy, 60 + i * 20, fill=1, stroke=0)

    random.seed(1415)
    for i in range(4):
        cx = random.uniform(50, W - 50)
        cy = random.uniform(200, H - 100)
        c.setFillColor(HexColor(f"#9C27B0{20 + i*10:02x}"))
        c.circle(cx, cy, 50 + i * 15, fill=1, stroke=0)

    # Planetas pasando
    dibujar_planeta(c, 80, H - 200, 30, AZUL_NEPTUNO)
    dibujar_planeta(c, 500, 300, 25, VERDE_PLANETA, HexColor("#81C784"))
    dibujar_estrella(c, 200, 600, 15, AMARILLO_ESTRELLA)
    dibujar_estrella(c, 450, 500, 12, CYAN_HIELO)

    # Cohete cruzando
    dibujar_cohete(c, W/2, H/2, escala=1.5)

    # Texto narrativo
    c.setFillColor(white)
    c.setFont(FUENTE_TITULO, 16)
    c.drawCentredString(W/2, H - 40, "Atravesando el cosmos")

    texto_parrafo(c,
        "El espacio era aún más hermoso de lo que Luna había imaginado. "
        "Nebulosas de colores, estrellas fugaces y planetas de todos los tamaños "
        "pasaban junto a la ventana del Bigotes Estelar.",
        60, H - 70, W - 120, tamano=13, color=white)

    # Zip mirando por la ventana (burbuja)
    c.setFillColor(white)
    c.roundRect(330, H/2 + 80, 140, 30, 8, fill=1, stroke=1)
    c.setFillColor(black)
    c.setFont(FUENTE_TEXTO, 10)
    c.drawCentredString(400, H/2 + 90, "¡Bip bip! ¡Bonito!")

    numero_pagina(c, 14)
    c.showPage()

    # === PÁGINA 15: Capítulo 3 - Marte ===
    fondo_espacio_seed(c, 1515, HexColor("#1A0A0A"))

    # Marte grande
    c.setFillColor(ROJO_MARTE)
    c.circle(W/2, H/2 - 80, 200, fill=1, stroke=0)

    # Detalles de Marte
    c.setFillColor(ARENA_MARTE)
    c.circle(W/2 - 60, H/2 - 40, 40, fill=1, stroke=0)
    c.circle(W/2 + 70, H/2 - 100, 30, fill=1, stroke=0)
    c.circle(W/2 + 20, H/2 + 20, 50, fill=1, stroke=0)

    c.setFillColor(HexColor("#A0360A"))
    c.circle(W/2 - 30, H/2 - 110, 25, fill=1, stroke=0)
    c.circle(W/2 + 90, H/2 - 50, 20, fill=1, stroke=0)

    # Casquetes polares
    c.setFillColor(HexColor("#E8E8E8"))
    c.ellipse(W/2 - 60, H/2 + 100, W/2 + 60, H/2 + 120, fill=1, stroke=0)

    # Cohete acercándose
    dibujar_cohete(c, 100, H - 150, escala=0.8)

    c.setFillColor(AMARILLO_ESTRELLA)
    c.setFont(FUENTE_TITULO, 22)
    c.drawCentredString(W/2, H - 40, "Capítulo 3")
    c.setFont(FUENTE_TITULO, 16)
    c.drawCentredString(W/2, H - 65, "El planeta rojo")

    texto_parrafo(c,
        "Después de un viaje espectacular, Marte apareció en el horizonte. "
        "Era enorme, rojo y misterioso. \"¡Prepárate para el aterrizaje, Zip!\" "
        "Luna ajustó sus gafas de piloto y agarró los controles.",
        60, 120, W - 120, tamano=13, color=white)

    numero_pagina(c, 15)
    c.showPage()

    c.save()
    print(f"  ✓ Páginas 13-15 creadas: {ruta}")

if __name__ == "__main__":
    crear("../pdfs/pag_13_15.pdf")
