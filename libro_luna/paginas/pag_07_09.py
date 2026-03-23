"""Páginas 7-9: Cohete terminado, despegue, adiós al pueblo."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import *
from reportlab.pdfgen import canvas
import math

def crear(ruta):
    c = canvas.Canvas(ruta, pagesize=A4)

    # === PÁGINA 7: El cohete terminado ===
    fondo_espacio_seed(c, 606, AZUL_NOCHE)

    # Suelo/plataforma
    c.setFillColor(HexColor("#455A64"))
    c.rect(0, 0, W, 100, fill=1, stroke=0)
    c.setFillColor(HexColor("#37474F"))
    c.rect(150, 100, 290, 20, fill=1, stroke=1)

    # Cohete grande
    dibujar_cohete(c, W/2, 340, escala=3.0)

    # Luna orgullosa al lado
    dibujar_luna_gata(c, 130, 140, escala=1.5, casco=False)

    # Destellos de orgullo
    for angle in range(0, 360, 45):
        x = 130 + 60 * math.cos(math.radians(angle))
        y = 210 + 60 * math.sin(math.radians(angle))
        dibujar_estrella(c, x, y, 5, AMARILLO_ESTRELLA)

    # Texto
    c.setFillColor(AMARILLO_ESTRELLA)
    c.setFont(FUENTE_TITULO, 18)
    c.drawCentredString(W/2, H - 40, "¡El Bigotes Estelar está listo!")

    texto_parrafo(c,
        "Después de muchas noches de trabajo, el cohete estaba terminado. Luna lo miró "
        "con orgullo. Era blanco y rojo, con una ventana redonda perfecta para asomarse. "
        "\"¡Mañana por la noche, despegaré!\", maulló emocionada.",
        60, H - 75, W - 120, tamano=13, color=white)

    numero_pagina(c, 7)
    c.showPage()

    # === PÁGINA 8: El despegue ===
    fondo_espacio_seed(c, 707, MORADO_ESPACIO)

    # Suelo con hierba
    c.setFillColor(HexColor("#1B5E20"))
    c.rect(0, 0, W, 80, fill=1, stroke=0)

    # Cohete despegando (con mucho fuego)
    dibujar_cohete(c, W/2, H/2 + 50, escala=2.5)

    # Humo/nubes de despegue
    for i in range(8):
        c.setFillColor(HexColor(f"#FFFFFF{40 + i*15:02x}"))
        x = W/2 + (i - 4) * 30
        c.circle(x, 100, 30 + i * 5, fill=1, stroke=0)

    # Texto dramático
    c.setFillColor(AMARILLO_ESTRELLA)
    c.setFont(FUENTE_TITULO, 28)
    c.drawCentredString(W/2, H - 40, "¡¡¡DESPEGUE!!!")

    c.setFillColor(white)
    c.setFont(FUENTE_TITULO, 16)
    c.drawCentredString(W/2, H - 70, "3... 2... 1... ¡MIAU!")

    # Onomatopeya
    c.saveState()
    c.setFillColor(NARANJA_SOL)
    c.setFont(FUENTE_TITULO, 40)
    c.translate(100, 300)
    c.rotate(15)
    c.drawString(0, 0, "¡BOOM!")
    c.restoreState()

    c.saveState()
    c.setFillColor(red)
    c.setFont(FUENTE_TITULO, 30)
    c.translate(350, 250)
    c.rotate(-10)
    c.drawString(0, 0, "¡FUUUSH!")
    c.restoreState()

    numero_pagina(c, 8)
    c.showPage()

    # === PÁGINA 9: Adiós al pueblo ===
    fondo_espacio_seed(c, 808, AZUL_ESPACIO)

    # La Tierra abajo (vista desde arriba)
    c.setFillColor(VERDE_PLANETA)
    c.circle(W/2, -200, 350, fill=1, stroke=0)
    c.setFillColor(AZUL_NEPTUNO)
    # Océanos
    c.circle(W/2 - 80, -100, 80, fill=1, stroke=0)
    c.circle(W/2 + 100, -150, 60, fill=1, stroke=0)

    # Atmósfera
    c.setStrokeColor(HexColor("#64B5F6"))
    c.setLineWidth(3)
    c.circle(W/2, -200, 355, fill=0, stroke=1)

    # Cohete alejándose (pequeño)
    dibujar_cohete(c, W/2, H/2 + 80, escala=1.2)

    # Luna asomándose por la ventana
    c.setFillColor(GRIS_LUNA_GATA)
    c.circle(W/2, H/2 + 85, 6, fill=1, stroke=0)

    # Burbuja de diálogo
    c.setFillColor(white)
    c.roundRect(300, H/2 + 160, 180, 50, 10, fill=1, stroke=1)
    # Piquito de la burbuja
    p = c.beginPath()
    p.moveTo(340, H/2 + 160)
    p.lineTo(320, H/2 + 140)
    p.lineTo(360, H/2 + 160)
    p.close()
    c.setFillColor(white)
    c.drawPath(p, fill=1, stroke=1)

    c.setFillColor(black)
    c.setFont(FUENTE_TITULO, 11)
    c.drawCentredString(390, H/2 + 180, "¡Adiós, Villa Estrella!")
    c.setFont(FUENTE_TEXTO, 10)
    c.drawCentredString(390, H/2 + 167, "¡Volveré pronto!")

    # Texto narrativo
    texto_parrafo(c,
        "El Bigotes Estelar atravesó las nubes y Luna vio cómo su pueblo se hacía "
        "cada vez más pequeño. Las luces de las casas parecían estrellas en el suelo. "
        "\"¡Es hermoso!\", susurró Luna con los ojos brillantes.",
        60, H - 50, W - 120, tamano=13, color=white)

    numero_pagina(c, 9)
    c.showPage()

    c.save()
    print(f"  ✓ Páginas 7-9 creadas: {ruta}")

if __name__ == "__main__":
    crear("../pdfs/pag_07_09.pdf")
