"""Páginas 25-27: Titán (luna de Saturno), despedida, camino a Urano."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import *
from reportlab.pdfgen import canvas
import random

def crear(ruta):
    c = canvas.Canvas(ruta, pagesize=A4)

    # === PÁGINA 25: Titán ===
    # Cielo naranja de Titán
    c.setFillColor(HexColor("#FF8F00"))
    c.rect(0, H * 0.3, W, H * 0.7, fill=1, stroke=0)

    # Suelo/lago de metano
    c.setFillColor(HexColor("#5D4037"))
    c.rect(0, 0, W, H * 0.3, fill=1, stroke=0)

    # Lagos de metano
    c.setFillColor(HexColor("#1A237E"))
    c.ellipse(50, 40, 200, 120, fill=1, stroke=0)
    c.ellipse(300, 20, 500, 100, fill=1, stroke=0)

    # Niebla
    c.setFillColor(HexColor("#FF8F0040"))
    c.rect(0, H * 0.25, W, H * 0.15, fill=1, stroke=0)

    # Saturno visible en el cielo
    dibujar_planeta(c, 400, H - 120, 60, NARANJA_SATURNO, AMARILLO_ESTRELLA, anillos=True)

    # Luna y Zip explorando
    dibujar_luna_gata(c, 200, H * 0.32, escala=1.4, casco=True, mirando="derecha")
    dibujar_zip_robot(c, 310, H * 0.31, escala=1.2)

    # Señal de Zip
    c.setFillColor(white)
    c.roundRect(340, H * 0.45, 150, 35, 8, fill=1, stroke=1)
    c.setFillColor(black)
    c.setFont(FUENTE_TEXTO, 10)
    c.drawCentredString(415, H * 0.46 + 10, "Bip: ¡Lago de metano!")

    texto_parrafo(c,
        "Aterrizaron en Titán, la luna más grande de Saturno. ¡Tenía lagos! "
        "Pero no de agua, sino de metano líquido. \"No creo que quiera nadar aquí\", "
        "dijo Luna arrugando la nariz. Zip escaneó el lago y su pantalla mostró un emoji de peligro.",
        60, H - 50, W - 120, tamano=12, color=HexColor("#3E2723"))

    numero_pagina(c, 25)
    c.showPage()

    # === PÁGINA 26: Foto grupal en Saturno ===
    fondo_espacio_seed(c, 2626, HexColor("#150830"))

    # Saturno de fondo
    dibujar_planeta(c, W/2, H/2, 120, NARANJA_SATURNO, AMARILLO_ESTRELLA, anillos=True)

    # Marco de foto
    c.setStrokeColor(white)
    c.setLineWidth(4)
    c.rect(100, 200, 390, 350, fill=0, stroke=1)

    # Dentro del marco: Luna y Zip posando
    dibujar_luna_gata(c, 230, 330, escala=1.8, casco=True)
    dibujar_zip_robot(c, 360, 320, escala=1.6)

    # Flash de la cámara
    dibujar_estrella(c, 295, 530, 20, white)

    # Texto tipo Polaroid
    c.setFillColor(white)
    c.rect(100, 200, 390, 50, fill=1, stroke=0)
    c.setFillColor(black)
    c.setFont(FUENTE_ITALIC, 14)
    c.drawCentredString(295, 215, "¡Selfie en Saturno! 📸")

    texto_parrafo(c,
        "Antes de irse, Luna y Zip se sacaron una foto con Saturno de fondo. "
        "\"¡Di queso!\" maulló Luna. \"¡Bip!\" respondió Zip, que no sabía qué era el queso "
        "pero hacía su mejor esfuerzo.",
        60, H - 50, W - 120, tamano=13, color=white)

    numero_pagina(c, 26)
    c.showPage()

    # === PÁGINA 27: Capítulo 6 - Rumbo a Urano y Neptuno ===
    fondo_espacio_seed(c, 2727, AZUL_OSCURO)

    # Mapa estelar
    c.setStrokeColor(HexColor("#FFFFFF40"))
    c.setLineWidth(1)
    c.setDash([4, 4])

    # Puntos del recorrido
    planetas_mapa = [
        (100, 200, "Tierra", AZUL_NEPTUNO, 15),
        (170, 320, "Luna", HexColor("#E0E0E0"), 10),
        (260, 250, "Marte", ROJO_MARTE, 12),
        (350, 400, "Júpiter", LILA_JUPITER, 20),
        (430, 300, "Saturno", NARANJA_SATURNO, 16),
        (500, 450, "¿?", CYAN_HIELO, 14),
    ]

    # Líneas conectando
    for i in range(len(planetas_mapa) - 1):
        x1, y1 = planetas_mapa[i][0], planetas_mapa[i][1]
        x2, y2 = planetas_mapa[i+1][0], planetas_mapa[i+1][1]
        c.line(x1, y1, x2, y2)

    c.setDash([])

    # Planetas en el mapa
    for x, y, nombre, color, radio in planetas_mapa:
        c.setFillColor(color)
        c.circle(x, y, radio, fill=1, stroke=1)
        c.setFillColor(white)
        c.setFont(FUENTE_TEXTO, 9)
        c.drawCentredString(x, y - radio - 10, nombre)

    # Marca "Estás aquí" en Saturno
    c.setFillColor(VERDE_ALIEN)
    c.setFont(FUENTE_TITULO, 10)
    c.drawString(440, 325, "← ¡Aquí!")

    # Cohete en el mapa
    dibujar_cohete(c, 470, 380, escala=0.5)

    c.setFillColor(AMARILLO_ESTRELLA)
    c.setFont(FUENTE_TITULO, 22)
    c.drawCentredString(W/2, H - 40, "Capítulo 6")
    c.setFont(FUENTE_TITULO, 16)
    c.drawCentredString(W/2, H - 65, "Más allá de lo conocido")

    texto_parrafo(c,
        "Luna miró su mapa estelar. Ya habían visitado la Luna, Marte, Júpiter y Saturno. "
        "Ahora tocaba ir más lejos, a los planetas que casi nadie visita: "
        "Urano y Neptuno. \"¿Listo, Zip?\" \"¡Bip bip!\"",
        60, 120, W - 120, tamano=13, color=white)

    numero_pagina(c, 27)
    c.showPage()

    c.save()
    print(f"  ✓ Páginas 25-27 creadas: {ruta}")

if __name__ == "__main__":
    crear("../pdfs/pag_25_27.pdf")
