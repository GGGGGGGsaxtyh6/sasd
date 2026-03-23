"""Páginas 46-48: Luna cuenta sus aventuras, Zip se queda, la ventana de nuevo."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import *
from reportlab.pdfgen import canvas
import random

def crear(ruta):
    c = canvas.Canvas(ruta, pagesize=A4)

    # === PÁGINA 46: Luna cuenta la aventura ===
    # Interior de la casa (acogedor)
    c.setFillColor(HexColor("#FFF3E0"))
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # Suelo de madera
    c.setFillColor(HexColor("#8D6E63"))
    c.rect(0, 0, W, 100, fill=1, stroke=0)
    c.setStrokeColor(HexColor("#6D4C41"))
    c.setLineWidth(1)
    for i in range(8):
        c.line(0, 100, W, 100)
        y = i * 12 + 5
        c.line(0, y, W, y)

    # Sofá
    c.setFillColor(HexColor("#7B1FA2"))
    c.roundRect(100, 100, 350, 80, 15, fill=1, stroke=1)
    c.roundRect(90, 100, 30, 130, 10, fill=1, stroke=1)
    c.roundRect(440, 100, 30, 130, 10, fill=1, stroke=1)

    # Luna en el sofá contando historias
    dibujar_luna_gata(c, 200, 210, escala=1.3, casco=False, mirando="derecha")
    dibujar_zip_robot(c, 350, 200, escala=1.0)

    # Objetos del viaje en una mesa
    c.setFillColor(HexColor("#795548"))
    c.rect(150, 340, 250, 10, fill=1, stroke=1)

    # Piedra de Marte
    c.setFillColor(ROJO_MARTE)
    c.circle(200, 360, 10, fill=1, stroke=1)
    c.setFillColor(black)
    c.setFont(FUENTE_TEXTO, 7)
    c.drawCentredString(200, 375, "Marte")

    # Cristal de asteroide
    c.setFillColor(HexColor("#CE93D8"))
    pts = [(260, 350), (250, 365), (260, 375), (270, 365)]
    p = c.beginPath()
    p.moveTo(pts[0][0], pts[0][1])
    for px, py in pts[1:]:
        p.lineTo(px, py)
    p.close()
    c.drawPath(p, fill=1, stroke=1)
    c.setFillColor(black)
    c.setFont(FUENTE_TEXTO, 7)
    c.drawCentredString(260, 380, "Cristal")

    # Esfera de luz
    c.setFillColor(HexColor("#FFD70060"))
    c.circle(330, 360, 15, fill=1, stroke=0)
    c.setFillColor(AMARILLO_ESTRELLA)
    c.circle(330, 360, 8, fill=1, stroke=0)
    c.setFillColor(black)
    c.setFont(FUENTE_TEXTO, 7)
    c.drawCentredString(330, 380, "Esfera")

    # Burbuja de narración
    c.setFillColor(HexColor("#E1BEE7"))
    c.roundRect(80, H - 200, 400, 100, 15, fill=1, stroke=1)
    c.setFillColor(HexColor("#4A148C"))
    c.setFont(FUENTE_ITALIC, 12)
    c.drawCentredString(280, H - 130, "\"...y entonces los Blobitos se pusieron")
    c.drawCentredString(280, H - 148, "todos dorados de alegría, ¡y empezaron")
    c.drawCentredString(280, H - 166, "a bailar una danza cósmica!\"")

    texto_parrafo(c,
        "Luna no paraba de contar historias. Cada noche, los vecinos venían a escuchar "
        "una nueva aventura. Y ella las contaba con los ojos brillantes, "
        "como las estrellas que había visitado.",
        60, H - 220, W - 120, tamano=12, color=HexColor("#3E2723"))

    numero_pagina(c, 46)
    c.showPage()

    # === PÁGINA 47: Zip se queda a vivir ===
    # Jardín de la casa
    c.setFillColor(HexColor("#81C784"))
    c.rect(0, 0, W, H * 0.35, fill=1, stroke=0)
    c.setFillColor(HexColor("#64B5F6"))
    c.rect(0, H * 0.35, W, H * 0.65, fill=1, stroke=0)

    # Nubes
    c.setFillColor(white)
    c.circle(120, H - 60, 30, fill=1, stroke=0)
    c.circle(150, H - 60, 40, fill=1, stroke=0)
    c.circle(180, H - 60, 25, fill=1, stroke=0)
    c.circle(380, H - 100, 35, fill=1, stroke=0)
    c.circle(410, H - 100, 30, fill=1, stroke=0)

    # Sol
    c.setFillColor(AMARILLO_ESTRELLA)
    c.circle(480, H - 70, 40, fill=1, stroke=0)

    # Casita de Zip (al lado de la casa de Luna)
    # Casa de Luna
    c.setFillColor(HexColor("#8B4513"))
    c.rect(100, H * 0.35, 130, 110, fill=1, stroke=1)
    c.setFillColor(HexColor("#A0522D"))
    p2 = c.beginPath()
    p2.moveTo(90, H * 0.35 + 110)
    p2.lineTo(165, H * 0.35 + 160)
    p2.lineTo(240, H * 0.35 + 110)
    p2.close()
    c.drawPath(p2, fill=1, stroke=1)
    c.setFillColor(AMARILLO_ESTRELLA)
    c.rect(140, H * 0.35 + 30, 40, 40, fill=1, stroke=1)

    # Casita de Zip (pequeña, metálica)
    c.setFillColor(HexColor("#B0BEC5"))
    c.roundRect(280, H * 0.35, 80, 70, 10, fill=1, stroke=1)
    c.setFillColor(HexColor("#78909C"))
    c.roundRect(275, H * 0.35 + 70, 90, 15, 5, fill=1, stroke=1)
    c.setFillColor(CYAN_HIELO)
    c.circle(320, H * 0.35 + 40, 15, fill=1, stroke=1)
    # Antena
    c.setStrokeColor(black)
    c.setLineWidth(2)
    c.line(320, H * 0.35 + 85, 320, H * 0.35 + 100)
    c.setFillColor(VERDE_ALIEN)
    c.circle(320, H * 0.35 + 102, 4, fill=1, stroke=0)

    # Cartel "Casa de Zip"
    c.setFillColor(white)
    c.roundRect(290, H * 0.35 - 25, 60, 20, 5, fill=1, stroke=1)
    c.setFillColor(black)
    c.setFont(FUENTE_TEXTO, 8)
    c.drawCentredString(320, H * 0.35 - 18, "Casa de Zip")

    # Luna y Zip juntos en el jardín
    dibujar_luna_gata(c, 200, H * 0.35 - 30, escala=1.3, casco=False, mirando="derecha")
    dibujar_zip_robot(c, 310, H * 0.35 - 40, escala=1.1)

    # Flores
    for i in range(8):
        fx = 50 + i * 60
        fy = 60
        c.setStrokeColor(HexColor("#2E7D32"))
        c.setLineWidth(2)
        c.line(fx, 0, fx, fy)
        color_flor = [red, AMARILLO_ESTRELLA, ROSA_NEBULOSA, orange][i % 4]
        c.setFillColor(color_flor)
        c.circle(fx, fy, 8, fill=1, stroke=0)

    texto_parrafo(c,
        "Zip decidió quedarse a vivir con Luna. Le construyeron una casita al lado, "
        "con antena y todo. Ahora eran vecinos y mejores amigos. Cada mañana, "
        "Zip despertaba a Luna con un alegre \"¡Bip bip!\" que era su forma de decir "
        "\"¡Buenos días!\"",
        60, H - 40, W - 120, tamano=12, color=HexColor("#1A237E"))

    numero_pagina(c, 47)
    c.showPage()

    # === PÁGINA 48: De vuelta en la ventana ===
    fondo_espacio_seed(c, 4848, AZUL_NOCHE)

    # Ventana (como al principio)
    c.setFillColor(HexColor("#5D4037"))
    c.roundRect(80, 200, 430, 450, 15, fill=1, stroke=1)
    c.setFillColor(AZUL_ESPACIO)
    c.roundRect(95, 215, 400, 420, 10, fill=1, stroke=0)

    # Estrellas por la ventana
    random.seed(4848)
    for _ in range(30):
        x = random.uniform(100, 490)
        y = random.uniform(220, 630)
        c.setFillColor(AMARILLO_ESTRELLA)
        c.circle(x, y, random.uniform(1, 3), fill=1, stroke=0)

    # Pero ahora Luna mira con felicidad, no con anhelo
    dibujar_luna_gata(c, 250, 230, escala=1.6, casco=False, mirando="derecha")
    dibujar_zip_robot(c, 350, 225, escala=1.0)

    # Esfera de luz en la ventana
    c.setFillColor(HexColor("#FFD70040"))
    c.circle(400, 350, 20, fill=1, stroke=0)
    c.setFillColor(AMARILLO_ESTRELLA)
    c.circle(400, 350, 10, fill=1, stroke=0)

    texto_parrafo(c,
        "Cada noche, Luna volvía a sentarse en la ventana. Pero ahora era diferente. "
        "Ya no miraba las estrellas preguntándose qué había allá arriba. "
        "Ahora las miraba y sonreía, porque ya lo sabía. Y era maravilloso.",
        60, 170, W - 120, tamano=13, color=white)

    numero_pagina(c, 48)
    c.showPage()

    c.save()
    print(f"  ✓ Páginas 46-48 creadas: {ruta}")

if __name__ == "__main__":
    crear("../pdfs/pag_46_48.pdf")
