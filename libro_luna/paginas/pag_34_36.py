"""Páginas 34-36: Capítulo 8 - Asteroides, cinturón de asteroides, asteroide con cristales."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import *
from reportlab.pdfgen import canvas
import random, math

def crear(ruta):
    c = canvas.Canvas(ruta, pagesize=A4)

    # === PÁGINA 34: Capítulo 8 - Asteroides ===
    fondo_espacio_seed(c, 3434, AZUL_NOCHE)

    # Asteroides flotando
    random.seed(3434)
    for _ in range(20):
        x = random.uniform(50, W - 50)
        y = random.uniform(150, H - 100)
        size = random.uniform(10, 40)
        c.setFillColor(HexColor("#795548"))
        # Forma irregular (polígono)
        p = c.beginPath()
        pts = random.randint(5, 8)
        for i in range(pts):
            angle = i * 2 * math.pi / pts
            r = size * random.uniform(0.7, 1.3)
            px = x + r * math.cos(angle)
            py = y + r * math.sin(angle)
            if i == 0:
                p.moveTo(px, py)
            else:
                p.lineTo(px, py)
        p.close()
        c.drawPath(p, fill=1, stroke=1)

    c.setFillColor(AMARILLO_ESTRELLA)
    c.setFont(FUENTE_TITULO, 22)
    c.drawCentredString(W/2, H - 40, "Capítulo 8")
    c.setFont(FUENTE_TITULO, 16)
    c.drawCentredString(W/2, H - 65, "¡Cuidado con las rocas!")

    # Cohete esquivando
    c.saveState()
    c.translate(W/2, H/2 - 30)
    c.rotate(-10)
    dibujar_cohete(c, 0, 0, escala=1.3)
    c.restoreState()

    texto_parrafo(c,
        "De vuelta hacia casa, Luna y Zip tuvieron que cruzar el cinturón de asteroides. "
        "Miles de rocas enormes flotando por el espacio. \"¡Esto es como un videojuego!\", "
        "maulló Luna agarrando el volante con fuerza.",
        60, 120, W - 120, tamano=12, color=white)

    numero_pagina(c, 34)
    c.showPage()

    # === PÁGINA 35: Esquivando asteroides ===
    fondo_espacio_seed(c, 3535, HexColor("#0A0A20"))

    # Muchos asteroides
    random.seed(3535)
    for _ in range(30):
        x = random.uniform(0, W)
        y = random.uniform(0, H)
        size = random.uniform(15, 60)
        gris = random.randint(60, 120)
        c.setFillColor(HexColor(f"#{gris:02x}{gris-10:02x}{gris-20:02x}"))
        c.setStrokeColor(black)
        c.setLineWidth(1)
        p = c.beginPath()
        pts = random.randint(5, 9)
        for i in range(pts):
            angle = i * 2 * math.pi / pts
            r = size * random.uniform(0.6, 1.4)
            px = x + r * math.cos(angle)
            py = y + r * math.sin(angle)
            if i == 0:
                p.moveTo(px, py)
            else:
                p.lineTo(px, py)
        p.close()
        c.drawPath(p, fill=1, stroke=1)

    # Estela del cohete
    c.setStrokeColor(AMARILLO_ESTRELLA)
    c.setLineWidth(2)
    c.setDash([6, 4])
    p2 = c.beginPath()
    p2.moveTo(100, 100)
    p2.curveTo(200, 300, 150, 500, 300, 400)
    p2.curveTo(400, 300, 350, 600, W/2, H/2)
    c.drawPath(p2, fill=0, stroke=1)
    c.setDash([])

    # Cohete
    dibujar_cohete(c, W/2, H/2, escala=1.2)

    # Onomatopeyas
    c.setFillColor(NARANJA_SOL)
    c.setFont(FUENTE_TITULO, 22)
    c.saveState()
    c.translate(100, H - 150)
    c.rotate(15)
    c.drawString(0, 0, "¡ZIG!")
    c.restoreState()

    c.setFillColor(CYAN_HIELO)
    c.saveState()
    c.translate(380, H - 200)
    c.rotate(-12)
    c.drawString(0, 0, "¡ZAG!")
    c.restoreState()

    c.setFillColor(ROSA_NEBULOSA)
    c.saveState()
    c.translate(80, 300)
    c.rotate(8)
    c.drawString(0, 0, "¡ESQUIVA!")
    c.restoreState()

    texto_parrafo(c,
        "Luna movía el volante a izquierda y derecha, arriba y abajo. "
        "Zip le ayudaba calculando las trayectorias. ¡Eran un gran equipo! "
        "\"¡Zig! ¡Zag! ¡A la derecha! ¡Bip bip, ABAJO!\"",
        60, 130, W - 120, tamano=12, color=white)

    numero_pagina(c, 35)
    c.showPage()

    # === PÁGINA 36: El asteroide de cristal ===
    fondo_espacio_seed(c, 3636, HexColor("#0D0025"))

    # Asteroide gigante de cristal
    cx_a, cy_a = W/2, H/2
    c.setFillColor(HexColor("#E1BEE7"))
    c.setStrokeColor(HexColor("#CE93D8"))
    c.setLineWidth(2)

    # Forma de cristal (polígono grande)
    pts_cristal = [
        (cx_a, cy_a + 120), (cx_a - 80, cy_a + 60), (cx_a - 100, cy_a - 20),
        (cx_a - 60, cy_a - 100), (cx_a + 20, cy_a - 110), (cx_a + 90, cy_a - 60),
        (cx_a + 100, cy_a + 30), (cx_a + 60, cy_a + 100)
    ]
    p3 = c.beginPath()
    p3.moveTo(pts_cristal[0][0], pts_cristal[0][1])
    for px, py in pts_cristal[1:]:
        p3.lineTo(px, py)
    p3.close()
    c.drawPath(p3, fill=1, stroke=1)

    # Facetas del cristal
    c.setStrokeColor(HexColor("#BA68C8"))
    c.setLineWidth(1)
    for px, py in pts_cristal:
        c.line(cx_a, cy_a, px, py)

    # Brillo
    c.setFillColor(HexColor("#FFFFFF60"))
    c.circle(cx_a - 30, cy_a + 30, 25, fill=1, stroke=0)

    # Destellos
    for i in range(8):
        angle = i * math.pi / 4
        x = cx_a + 130 * math.cos(angle)
        y = cy_a + 130 * math.sin(angle)
        dibujar_estrella(c, x, y, 8, HexColor("#CE93D8"))

    # Luna y Zip asombrados
    dibujar_luna_gata(c, 80, 200, escala=1.2, casco=True)
    dibujar_zip_robot(c, 470, 200, escala=1.2)

    texto_parrafo(c,
        "En medio del cinturón, encontraron un asteroide hecho completamente de cristales "
        "morados. Brillaba como una joya gigante. \"¡Es precioso!\", exclamó Luna. "
        "Zip se acercó y escaneó un trozo: era amatista espacial, algo que no "
        "existía en la Tierra. ¡Se llevaron un pedacito de recuerdo!",
        60, H - 50, W - 120, tamano=11, color=white)

    numero_pagina(c, 36)
    c.showPage()

    c.save()
    print(f"  ✓ Páginas 34-36 creadas: {ruta}")

if __name__ == "__main__":
    crear("../pdfs/pag_34_36.pdf")
