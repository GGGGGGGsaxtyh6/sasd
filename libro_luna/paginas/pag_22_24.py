"""Páginas 22-24: Tormenta en Júpiter, Saturno, los anillos."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import *
from reportlab.pdfgen import canvas
import random, math

def crear(ruta):
    c = canvas.Canvas(ruta, pagesize=A4)

    # === PÁGINA 22: La Gran Mancha Roja (tormenta) ===
    fondo_espacio_seed(c, 2222, MORADO_ESPACIO)

    # Gran Mancha Roja como un remolino
    c.setFillColor(HexColor("#E57373"))
    c.circle(W/2, H/2, 180, fill=1, stroke=0)

    # Espiral de la tormenta
    for i in range(40):
        angle = i * 0.5
        r = 10 + i * 4
        x = W/2 + r * math.cos(angle)
        y = H/2 + r * math.sin(angle)
        c.setFillColor(HexColor(f"#{180 + i*2:02x}{80 + i:02x}{80 + i:02x}"))
        c.circle(x, y, 15 - i * 0.2, fill=1, stroke=0)

    # Centro oscuro
    c.setFillColor(HexColor("#C62828"))
    c.circle(W/2, H/2, 30, fill=1, stroke=0)

    # Cohete luchando contra el viento
    c.saveState()
    c.translate(150, H - 200)
    c.rotate(-15)
    dibujar_cohete(c, 0, 0, escala=1.0)
    c.restoreState()

    # Líneas de viento
    c.setStrokeColor(HexColor("#FFCDD2"))
    c.setLineWidth(2)
    c.setDash([6, 4])
    for i in range(6):
        y = 300 + i * 50
        c.line(50, y, W - 50, y + 30)
    c.setDash([])

    # Texto
    c.setFillColor(AMARILLO_ESTRELLA)
    c.setFont(FUENTE_TITULO, 16)
    c.drawCentredString(W/2, H - 40, "¡La Gran Mancha Roja!")

    texto_parrafo(c,
        "\"¡CUIDADO!\" gritó Luna. Se habían acercado demasiado a la Gran Mancha Roja, "
        "¡una tormenta que lleva girando 400 años! El viento sacudía el Bigotes Estelar. "
        "\"¡Bip bip bip bip!\", Zip se agarraba con todas sus pinzas.",
        60, H - 65, W - 120, tamano=12, color=white)

    # Onomatopeyas
    c.setFillColor(AMARILLO_ESTRELLA)
    c.setFont(FUENTE_TITULO, 24)
    c.saveState()
    c.translate(400, 400)
    c.rotate(20)
    c.drawString(0, 0, "¡WOOSH!")
    c.restoreState()

    numero_pagina(c, 22)
    c.showPage()

    # === PÁGINA 23: Capítulo 5 - Saturno ===
    fondo_espacio_seed(c, 2323, HexColor("#1A1040"))

    # Saturno grande y majestuoso
    dibujar_planeta(c, W/2, H/2 - 30, 150, NARANJA_SATURNO, AMARILLO_ESTRELLA, anillos=True)

    # Anillos extra con detalle
    c.setStrokeColor(HexColor("#D4A03880"))
    c.setLineWidth(8)
    c.ellipse(W/2 - 280, H/2 - 75, W/2 + 280, H/2 + 15, fill=0, stroke=1)

    c.setStrokeColor(HexColor("#FFD70060"))
    c.setLineWidth(5)
    c.ellipse(W/2 - 260, H/2 - 68, W/2 + 260, H/2 + 8, fill=0, stroke=1)

    # Cohete acercándose
    dibujar_cohete(c, 80, H - 180, escala=0.7)

    c.setFillColor(AMARILLO_ESTRELLA)
    c.setFont(FUENTE_TITULO, 22)
    c.drawCentredString(W/2, H - 40, "Capítulo 5")
    c.setFont(FUENTE_TITULO, 16)
    c.drawCentredString(W/2, H - 65, "El señor de los anillos")

    texto_parrafo(c,
        "Tras escapar de la tormenta, el siguiente destino era Saturno. "
        "Cuando apareció por la ventana, Luna no pudo contenerse: "
        "\"¡Es el planeta más bonito de todos!\" Los anillos brillaban "
        "como un collar de oro alrededor del planeta.",
        60, 120, W - 120, tamano=13, color=white)

    numero_pagina(c, 23)
    c.showPage()

    # === PÁGINA 24: Surfeando los anillos ===
    fondo_espacio_seed(c, 2424, HexColor("#0D0D30"))

    # Los anillos vistos de cerca (rocas y hielo)
    c.setStrokeColor(HexColor("#D4A038"))
    c.setLineWidth(1)
    random.seed(2424)
    for i in range(200):
        x = random.uniform(0, W)
        y = H/2 + random.uniform(-40, 40) + (x - W/2) * 0.05
        size = random.uniform(2, 8)
        color_r = random.choice([
            HexColor("#E8C87A"), HexColor("#D4A038"),
            HexColor("#F5E6C8"), HexColor("#FFFFFF"),
            HexColor("#C8A855")
        ])
        c.setFillColor(color_r)
        c.circle(x, y, size, fill=1, stroke=0)

    # Saturno parcial en el fondo
    c.setFillColor(NARANJA_SATURNO)
    c.circle(W + 100, H/2 + 200, 300, fill=1, stroke=0)

    # Cohete surfeando entre las rocas
    c.saveState()
    c.translate(W/2, H/2 + 20)
    c.rotate(5)
    dibujar_cohete(c, 0, 0, escala=1.3)
    c.restoreState()

    # Burbuja
    c.setFillColor(white)
    c.roundRect(50, H - 150, 200, 50, 10, fill=1, stroke=1)
    p = c.beginPath()
    p.moveTo(150, H - 150)
    p.lineTo(W/2 - 30, H/2 + 80)
    p.lineTo(180, H - 150)
    p.close()
    c.drawPath(p, fill=1, stroke=1)
    c.setFillColor(black)
    c.setFont(FUENTE_TITULO, 12)
    c.drawCentredString(150, H - 130, "¡Estamos surfeando")
    c.drawCentredString(150, H - 145, "en los anillos!")

    texto_parrafo(c,
        "Luna decidió volar entre los anillos de Saturno. ¡Eran millones de trozos "
        "de hielo y roca flotando en el espacio! El Bigotes Estelar zigzagueaba "
        "entre ellos como un gato persiguiendo mariposas. ¡Era súper divertido!",
        60, 120, W - 120, tamano=12, color=white)

    numero_pagina(c, 24)
    c.showPage()

    c.save()
    print(f"  ✓ Páginas 22-24 creadas: {ruta}")

if __name__ == "__main__":
    crear("../pdfs/pag_22_24.pdf")
