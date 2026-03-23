"""Páginas 31-33: Escapan de Neptuno, Capítulo 7 - Nebulosa, la nebulosa de colores."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import *
from reportlab.pdfgen import canvas
import random, math

def crear(ruta):
    c = canvas.Canvas(ruta, pagesize=A4)

    # === PÁGINA 31: Escapan de la tormenta ===
    fondo_espacio_seed(c, 3131, AZUL_ESPACIO)

    # Neptuno alejándose
    c.setFillColor(AZUL_NEPTUNO)
    c.circle(W/2, -150, 200, fill=1, stroke=0)

    # Cohete escapando rápido (con efecto velocidad)
    dibujar_cohete(c, W/2, H/2 + 50, escala=1.8)

    # Líneas de velocidad
    c.setStrokeColor(HexColor("#FFFFFF60"))
    c.setLineWidth(2)
    for i in range(10):
        random.seed(3131 + i)
        x = random.uniform(50, W - 50)
        y_start = random.uniform(H/2 - 100, H - 50)
        c.line(x, y_start, x + random.uniform(-10, 10), y_start + 60)

    # Luna y Zip aliviados
    c.setFillColor(white)
    c.roundRect(320, H/2 + 100, 160, 50, 8, fill=1, stroke=1)
    p = c.beginPath()
    p.moveTo(350, H/2 + 100)
    p.lineTo(W/2 + 20, H/2 + 80)
    p.lineTo(370, H/2 + 100)
    p.close()
    c.drawPath(p, fill=1, stroke=1)
    c.setFillColor(black)
    c.setFont(FUENTE_TITULO, 12)
    c.drawCentredString(400, H/2 + 128, "¡Uf! ¡Por los")
    c.drawCentredString(400, H/2 + 112, "bigotes de mi abuela!")

    texto_parrafo(c,
        "Después de un rato terrorífico, Luna logró controlar el cohete y escapar "
        "de los vientos de Neptuno. Zip hizo un diagnóstico: todo estaba bien, "
        "solo un poco de pintura raspada. \"¡Menuda aventura!\"",
        60, H - 50, W - 120, tamano=13, color=white)

    numero_pagina(c, 31)
    c.showPage()

    # === PÁGINA 32: Capítulo 7 - La Nebulosa ===
    fondo_espacio_seed(c, 3232, MORADO_ESPACIO)

    # Nebulosa hermosa con muchos colores
    random.seed(3232)
    colores_nebulosa = [
        HexColor("#E91E6340"), HexColor("#9C27B040"), HexColor("#2196F340"),
        HexColor("#00BCD440"), HexColor("#FF980040"), HexColor("#F4433640"),
    ]
    for _ in range(25):
        x = random.uniform(50, W - 50)
        y = random.uniform(150, H - 100)
        r = random.uniform(40, 120)
        c.setFillColor(random.choice(colores_nebulosa))
        c.circle(x, y, r, fill=1, stroke=0)

    # Estrellas nacientes (más brillantes)
    random.seed(3233)
    for _ in range(15):
        x = random.uniform(100, W - 100)
        y = random.uniform(200, H - 150)
        dibujar_estrella(c, x, y, random.uniform(4, 10), AMARILLO_ESTRELLA)

    c.setFillColor(AMARILLO_ESTRELLA)
    c.setFont(FUENTE_TITULO, 22)
    c.drawCentredString(W/2, H - 40, "Capítulo 7")
    c.setFont(FUENTE_TITULO, 16)
    c.drawCentredString(W/2, H - 65, "El lugar donde nacen las estrellas")

    texto_parrafo(c,
        "Más allá de los planetas, Luna y Zip encontraron algo mágico: "
        "una nebulosa. Un enorme nube de gas y polvo donde nacen las estrellas. "
        "Era como un cuadro pintado por el universo.",
        60, 120, W - 120, tamano=13, color=white)

    numero_pagina(c, 32)
    c.showPage()

    # === PÁGINA 33: Dentro de la nebulosa ===
    # Fondo multicolor
    c.setFillColor(HexColor("#1A0030"))
    c.rect(0, 0, W, H, fill=1, stroke=0)

    random.seed(3333)
    for _ in range(40):
        x = random.uniform(0, W)
        y = random.uniform(0, H)
        r = random.uniform(30, 100)
        colores = [
            HexColor("#FF69B430"), HexColor("#9C27B030"),
            HexColor("#E91E6320"), HexColor("#FF980020"),
            HexColor("#2196F320"), HexColor("#00BCD420"),
        ]
        c.setFillColor(random.choice(colores))
        c.circle(x, y, r, fill=1, stroke=0)

    # Estrellas bebé (recién formándose)
    random.seed(3334)
    for _ in range(8):
        x = random.uniform(80, W - 80)
        y = random.uniform(200, H - 150)
        r = random.uniform(8, 18)
        # Halo
        c.setFillColor(HexColor("#FFD70030"))
        c.circle(x, y, r * 2.5, fill=1, stroke=0)
        c.setFillColor(HexColor("#FFD70060"))
        c.circle(x, y, r * 1.5, fill=1, stroke=0)
        # Estrella
        c.setFillColor(AMARILLO_ESTRELLA)
        c.circle(x, y, r, fill=1, stroke=0)

    # Luna flotando asombrada
    dibujar_luna_gata(c, W/2, H/2 - 30, escala=1.5, casco=True)
    dibujar_zip_robot(c, W/2 + 80, H/2 - 50, escala=1.0)

    # Corazoncitos de asombro
    c.setFillColor(ROSA_NEBULOSA)
    c.setFont(FUENTE_TITULO, 20)
    c.drawString(W/2 + 30, H/2 + 40, "♥")
    c.drawString(W/2 - 50, H/2 + 50, "♥")

    texto_parrafo(c,
        "Dentro de la nebulosa era como flotar en un sueño. Colores por todas partes: "
        "rosa, morado, azul, naranja... Y pequeñas estrellas recién nacidas brillando "
        "con su primera luz. Luna lloró de emoción. \"Es lo más bonito del universo.\"",
        60, 140, W - 120, tamano=12, color=white)

    numero_pagina(c, 33)
    c.showPage()

    c.save()
    print(f"  ✓ Páginas 31-33 creadas: {ruta}")

if __name__ == "__main__":
    crear("../pdfs/pag_31_33.pdf")
