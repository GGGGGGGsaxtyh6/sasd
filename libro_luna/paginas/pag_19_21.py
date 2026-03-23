"""Páginas 19-21: Despedida de Marte, viaje a Júpiter, llegada a Júpiter."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import *
from reportlab.pdfgen import canvas
import random, math

def crear(ruta):
    c = canvas.Canvas(ruta, pagesize=A4)

    # === PÁGINA 19: Despedida de Marte ===
    c.setFillColor(HexColor("#FFB74D"))
    c.rect(0, H * 0.3, W, H * 0.7, fill=1, stroke=0)
    c.setFillColor(ROJO_MARTE)
    c.rect(0, 0, W, H * 0.3, fill=1, stroke=0)

    # Rojo despidiéndose
    cx_m, cy_m = 180, H * 0.32 + 20
    s = 1.3
    c.setFillColor(VERDE_ALIEN)
    c.ellipse(cx_m - 15*s, cy_m - 20*s, cx_m + 15*s, cy_m + 10*s, fill=1, stroke=1)
    c.circle(cx_m, cy_m + 20*s, 15*s, fill=1, stroke=1)
    c.setFillColor(black)
    c.ellipse(cx_m - 10*s, cy_m + 15*s, cx_m - 2*s, cy_m + 28*s, fill=1, stroke=0)
    c.ellipse(cx_m + 2*s, cy_m + 15*s, cx_m + 10*s, cy_m + 28*s, fill=1, stroke=0)
    # Mano levantada (despidiendo)
    c.setFillColor(VERDE_ALIEN)
    c.setStrokeColor(black)
    c.setLineWidth(1)
    c.ellipse(cx_m + 25*s, cy_m + 15*s, cx_m + 35*s, cy_m + 25*s, fill=1, stroke=1)

    # Cohete despegando
    dibujar_cohete(c, 400, H/2 + 100, escala=1.5)

    # Burbuja del marcianito
    c.setFillColor(white)
    c.roundRect(80, H * 0.55, 170, 35, 8, fill=1, stroke=1)
    c.setFillColor(black)
    c.setFont(FUENTE_TITULO, 11)
    c.drawCentredString(165, H * 0.56 + 10, "¡Adiós amigos! ¡Volved!")

    texto_parrafo(c,
        "Luna y Zip se despidieron de Rojo con un gran abrazo. Bueno, Luna le dio "
        "un abrazo y Zip chocó antenas con él. \"¡Prometo volver!\", dijo Luna. "
        "Rojo agitó sus cuatro bracitos mientras el cohete despegaba.",
        60, H - 50, W - 120, tamano=13, color=HexColor("#3E2723"))

    numero_pagina(c, 19)
    c.showPage()

    # === PÁGINA 20: Capítulo 4 - Júpiter ===
    fondo_espacio_seed(c, 2020, MORADO_ESPACIO)

    # Júpiter enorme
    c.setFillColor(LILA_JUPITER)
    c.circle(W/2, H/2 - 100, 220, fill=1, stroke=0)

    # Bandas de Júpiter
    colores_bandas = [
        HexColor("#B39DDB"), HexColor("#7E57C2"), HexColor("#CE93D8"),
        HexColor("#9575CD"), HexColor("#AB47BC")
    ]
    for i, color in enumerate(colores_bandas):
        y_banda = H/2 - 100 - 150 + i * 60
        c.setFillColor(color)
        c.rect(W/2 - 220, y_banda, 440, 25, fill=1, stroke=0)

    # Recortar (cubrir con espacio fuera del planeta)
    c.setFillColor(MORADO_ESPACIO)
    # Cubrir esquinas - simular círculo
    for angle in range(0, 360, 2):
        rad = math.radians(angle)
        px = W/2 + 220 * math.cos(rad)
        py = H/2 - 100 + 220 * math.sin(rad)

    # Gran mancha roja
    c.setFillColor(HexColor("#E57373"))
    c.ellipse(W/2 + 40, H/2 - 130, W/2 + 110, H/2 - 90, fill=1, stroke=0)

    # Cohete
    dibujar_cohete(c, 80, H - 150, escala=0.8)

    c.setFillColor(AMARILLO_ESTRELLA)
    c.setFont(FUENTE_TITULO, 22)
    c.drawCentredString(W/2, H - 40, "Capítulo 4")
    c.setFont(FUENTE_TITULO, 16)
    c.drawCentredString(W/2, H - 65, "El gigante gaseoso")

    texto_parrafo(c,
        "Júpiter era ¡GIGANTESCO! Era tan grande que cabían mil Tierras dentro. "
        "Luna se quedó con la boca abierta al verlo por la ventana. "
        "Las nubes de colores giraban formando remolinos preciosos.",
        60, 120, W - 120, tamano=13, color=white)

    numero_pagina(c, 20)
    c.showPage()

    # === PÁGINA 21: Las lunas de Júpiter ===
    fondo_espacio_seed(c, 2121, AZUL_OSCURO)

    # Parte de Júpiter a la izquierda
    c.setFillColor(LILA_JUPITER)
    c.circle(-100, H/2, 250, fill=1, stroke=0)
    c.setFillColor(HexColor("#9575CD"))
    c.rect(-100, H/2 - 50, 250, 30, fill=1, stroke=0)
    c.rect(-100, H/2 + 30, 250, 20, fill=1, stroke=0)

    # Lunas de Júpiter
    # Europa (helada)
    c.setFillColor(HexColor("#E3F2FD"))
    c.circle(300, H - 150, 35, fill=1, stroke=1)
    c.setFillColor(HexColor("#90CAF9"))
    c.line(280, H - 145, 315, H - 160)
    c.line(290, H - 135, 320, H - 150)
    c.setFillColor(white)
    c.setFont(FUENTE_TEXTO, 9)
    c.drawCentredString(300, H - 195, "Europa")

    # Ío (volcánica)
    c.setFillColor(AMARILLO_ESTRELLA)
    c.circle(450, H - 250, 30, fill=1, stroke=1)
    c.setFillColor(NARANJA_SOL)
    c.circle(440, H - 245, 8, fill=1, stroke=0)
    c.circle(460, H - 260, 6, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont(FUENTE_TEXTO, 9)
    c.drawCentredString(450, H - 290, "Ío")

    # Ganímedes
    c.setFillColor(HexColor("#BCAAA4"))
    c.circle(400, 200, 40, fill=1, stroke=1)
    c.setFillColor(white)
    c.setFont(FUENTE_TEXTO, 9)
    c.drawCentredString(400, 150, "Ganímedes")

    # Luna y Zip en el cohete
    dibujar_cohete(c, 280, H/2, escala=1.0)

    # Burbuja de Luna
    c.setFillColor(white)
    c.roundRect(320, H/2 + 80, 180, 40, 8, fill=1, stroke=1)
    p = c.beginPath()
    p.moveTo(340, H/2 + 80)
    p.lineTo(310, H/2 + 60)
    p.lineTo(360, H/2 + 80)
    p.close()
    c.drawPath(p, fill=1, stroke=1)
    c.setFillColor(black)
    c.setFont(FUENTE_TITULO, 10)
    c.drawCentredString(410, H/2 + 95, "¡Júpiter tiene 95 lunas!")
    c.setFont(FUENTE_TEXTO, 9)
    c.drawCentredString(410, H/2 + 83, "¡Y yo me llamo como una!")

    texto_parrafo(c,
        "Luna descubrió que Júpiter tenía 95 lunas. \"¡95! ¡Si yo soy Luna, "
        "entonces aquí tengo 95 primas!\", bromeó. Zip calculó que visitarlas todas "
        "les llevaría 3 años, así que decidieron quedarse con las fotos.",
        60, 120, W - 120, tamano=12, color=white)

    numero_pagina(c, 21)
    c.showPage()

    c.save()
    print(f"  ✓ Páginas 19-21 creadas: {ruta}")

if __name__ == "__main__":
    crear("../pdfs/pag_19_21.pdf")
