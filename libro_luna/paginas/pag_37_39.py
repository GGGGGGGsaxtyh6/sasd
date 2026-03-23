"""Páginas 37-39: Capítulo 9 - Galaxia lejana, encuentro con alienígenas amistosos, fiesta galáctica."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import *
from reportlab.pdfgen import canvas
import random, math

def crear(ruta):
    c = canvas.Canvas(ruta, pagesize=A4)

    # === PÁGINA 37: Capítulo 9 - Otra galaxia ===
    fondo_espacio_seed(c, 3737, HexColor("#050510"))

    # Galaxia espiral
    cx_g, cy_g = W/2, H/2
    random.seed(3737)
    for i in range(500):
        angle = i * 0.05
        r = 20 + i * 0.4
        arm = (i % 2) * math.pi
        x = cx_g + r * math.cos(angle + arm)
        y = cy_g + r * math.sin(angle + arm) * 0.5
        brillo = max(0.3, 1 - i / 600)
        size = max(0.5, 3 - i * 0.004)
        c.setFillColor(HexColor(f"#{int(brillo*200):02x}{int(brillo*180):02x}{int(brillo*255):02x}"))
        c.circle(x, y, size, fill=1, stroke=0)

    # Centro brillante
    c.setFillColor(HexColor("#FFD70040"))
    c.circle(cx_g, cy_g, 40, fill=1, stroke=0)
    c.setFillColor(HexColor("#FFD70070"))
    c.circle(cx_g, cy_g, 20, fill=1, stroke=0)

    # Cohete
    dibujar_cohete(c, 100, 200, escala=0.7)

    c.setFillColor(AMARILLO_ESTRELLA)
    c.setFont(FUENTE_TITULO, 22)
    c.drawCentredString(W/2, H - 40, "Capítulo 9")
    c.setFont(FUENTE_TITULO, 16)
    c.drawCentredString(W/2, H - 65, "Más allá de la Vía Láctea")

    texto_parrafo(c,
        "La curiosidad de Luna era imparable. ¿Y si iban más lejos? ¿Fuera de su propia "
        "galaxia? Zip calculó las coordenadas y... ¡activaron el motor de salto estelar! "
        "En un instante, estaban en otra galaxia.",
        60, 120, W - 120, tamano=12, color=white)

    numero_pagina(c, 37)
    c.showPage()

    # === PÁGINA 38: Alienígenas amistosos ===
    fondo_espacio_seed(c, 3838, HexColor("#1A0040"))

    # Planeta alienígena (rosa y azul)
    c.setFillColor(ROSA_NEBULOSA)
    c.circle(W/2, -50, 300, fill=1, stroke=0)
    c.setFillColor(HexColor("#E91E63"))
    c.circle(W/2 - 80, 50, 60, fill=1, stroke=0)
    c.circle(W/2 + 100, 30, 40, fill=1, stroke=0)

    # Vegetación alienígena
    for i in range(5):
        x = 80 + i * 100
        c.setFillColor(HexColor("#00E676"))
        # Árbol alienígena (champiñón)
        c.setLineWidth(2)
        c.setStrokeColor(HexColor("#00C853"))
        c.rect(x - 3, 230, 6, 30, fill=1, stroke=1)
        c.circle(x, 275, 15, fill=1, stroke=1)

    # Alienígenas simpáticos (blobitos)
    for i, (ax, ay) in enumerate([(150, 280), (350, 300), (450, 270)]):
        colores_alien = [HexColor("#7C4DFF"), HexColor("#00E5FF"), HexColor("#FF6D00")]
        c.setFillColor(colores_alien[i])
        c.setStrokeColor(black)
        c.setLineWidth(1)
        # Cuerpo blobito
        c.ellipse(ax - 20, ay - 15, ax + 20, ay + 15, fill=1, stroke=1)
        # Ojos
        c.setFillColor(white)
        c.circle(ax - 7, ay + 5, 6, fill=1, stroke=1)
        c.circle(ax + 7, ay + 5, 6, fill=1, stroke=1)
        c.setFillColor(black)
        c.circle(ax - 7, ay + 5, 3, fill=1, stroke=0)
        c.circle(ax + 7, ay + 5, 3, fill=1, stroke=0)
        # Sonrisa
        c.setStrokeColor(black)
        p = c.beginPath()
        p.moveTo(ax - 8, ay - 3)
        p.curveTo(ax - 4, ay - 8, ax + 4, ay - 8, ax + 8, ay - 3)
        c.drawPath(p, fill=0, stroke=1)
        # Un tentáculo saludando
        c.setStrokeColor(colores_alien[i])
        c.setLineWidth(3)
        c.line(ax + 18, ay, ax + 30, ay + 20)

    # Luna y Zip
    dibujar_luna_gata(c, 260, 320, escala=1.3, casco=True, mirando="derecha")
    dibujar_zip_robot(c, 300, 315, escala=0.8)

    c.setFillColor(AMARILLO_ESTRELLA)
    c.setFont(FUENTE_TITULO, 16)
    c.drawCentredString(W/2, H - 40, "¡Los Blobitos!")

    texto_parrafo(c,
        "En un planeta rosa encontraron a los Blobitos: unos alienígenas blanditos, "
        "de colores y muy simpáticos. No hablaban con palabras, sino con colores: "
        "se ponían amarillos cuando estaban contentos y azules cuando tenían hambre. "
        "¡Luna les encantó! Se pusieron todos dorados.",
        60, H - 70, W - 120, tamano=11, color=white)

    numero_pagina(c, 38)
    c.showPage()

    # === PÁGINA 39: Fiesta galáctica ===
    c.setFillColor(HexColor("#1A0040"))
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # Luces de fiesta
    random.seed(3939)
    for _ in range(50):
        x = random.uniform(0, W)
        y = random.uniform(0, H)
        color = random.choice([
            ROSA_NEBULOSA, AMARILLO_ESTRELLA, CYAN_HIELO,
            VERDE_ALIEN, NARANJA_SOL, HexColor("#7C4DFF")
        ])
        c.setFillColor(color)
        c.circle(x, y, random.uniform(3, 10), fill=1, stroke=0)

    # Guirnaldas
    c.setStrokeColor(AMARILLO_ESTRELLA)
    c.setLineWidth(2)
    p = c.beginPath()
    p.moveTo(0, H - 80)
    for i in range(7):
        x1 = i * W / 6
        x2 = (i + 0.5) * W / 6
        p.curveTo(x1, H - 120, x2, H - 120, (i + 1) * W / 6, H - 80)
    c.drawPath(p, fill=0, stroke=1)

    # Luna bailando
    dibujar_luna_gata(c, 200, H/2, escala=1.5, casco=False)

    # Zip bailando (con notas musicales)
    dibujar_zip_robot(c, 380, H/2 - 10, escala=1.3)

    # Notas musicales
    c.setFillColor(AMARILLO_ESTRELLA)
    c.setFont(FUENTE_TITULO, 24)
    c.drawString(150, H/2 + 80, "♪")
    c.drawString(330, H/2 + 90, "♫")
    c.drawString(430, H/2 + 70, "♪")
    c.drawString(250, H/2 + 100, "♫")

    # Blobitos bailando
    for i, (bx, by) in enumerate([(100, H/2 - 50), (300, H/2 - 60), (480, H/2 - 40)]):
        colores_b = [HexColor("#7C4DFF"), HexColor("#00E5FF"), HexColor("#FF6D00")]
        c.setFillColor(colores_b[i])
        c.ellipse(bx - 15, by - 10, bx + 15, by + 10, fill=1, stroke=1)
        c.setFillColor(white)
        c.circle(bx - 5, by + 3, 4, fill=1, stroke=0)
        c.circle(bx + 5, by + 3, 4, fill=1, stroke=0)

    c.setFillColor(AMARILLO_ESTRELLA)
    c.setFont(FUENTE_TITULO, 18)
    c.drawCentredString(W/2, H - 40, "¡Fiesta intergaláctica!")

    texto_parrafo(c,
        "Los Blobitos organizaron una fiesta de bienvenida. ¡Con música cósmica "
        "y luces de todos los colores! Luna bailó como nunca (los gatos son muy buenos "
        "bailarines, ¿sabías?). Zip hacía breakdance con sus ruedas. "
        "¡Fue la mejor fiesta de la galaxia!",
        60, 150, W - 120, tamano=12, color=white)

    numero_pagina(c, 39)
    c.showPage()

    c.save()
    print(f"  ✓ Páginas 37-39 creadas: {ruta}")

if __name__ == "__main__":
    crear("../pdfs/pag_37_39.pdf")
