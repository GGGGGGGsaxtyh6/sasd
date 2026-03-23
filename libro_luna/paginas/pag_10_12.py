"""Páginas 10-12: Llegada a la Luna (satélite), paseo lunar, encuentro con Zip."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import *
from reportlab.pdfgen import canvas

def crear(ruta):
    c = canvas.Canvas(ruta, pagesize=A4)

    # === PÁGINA 10: Capítulo 2 - La Luna ===
    fondo_espacio_seed(c, 1010, AZUL_ESPACIO)

    # La Luna (satélite) grande
    c.setFillColor(HexColor("#E0E0E0"))
    c.circle(W/2, H/2 - 50, 180, fill=1, stroke=0)
    # Cráteres
    c.setFillColor(HexColor("#BDBDBD"))
    c.circle(W/2 - 60, H/2 - 20, 30, fill=1, stroke=0)
    c.circle(W/2 + 40, H/2 - 80, 20, fill=1, stroke=0)
    c.circle(W/2 + 80, H/2, 25, fill=1, stroke=0)
    c.circle(W/2 - 20, H/2 - 100, 15, fill=1, stroke=0)
    c.circle(W/2 + 20, H/2 + 30, 35, fill=1, stroke=0)

    c.setFillColor(HexColor("#9E9E9E"))
    c.circle(W/2 - 60, H/2 - 20, 25, fill=1, stroke=0)
    c.circle(W/2 + 40, H/2 - 80, 15, fill=1, stroke=0)
    c.circle(W/2 + 20, H/2 + 30, 28, fill=1, stroke=0)

    # Cohete acercándose
    dibujar_cohete(c, 130, H - 200, escala=1.0)

    # Título de capítulo
    c.setFillColor(AMARILLO_ESTRELLA)
    c.setFont(FUENTE_TITULO, 22)
    c.drawCentredString(W/2, H - 40, "Capítulo 2")
    c.setFont(FUENTE_TITULO, 16)
    c.drawCentredString(W/2, H - 65, "Primera parada: ¡La Luna!")

    texto_parrafo(c,
        "La primera parada del viaje fue la Luna. Esa gran bola blanca que Luna "
        "había mirado tantas noches desde su ventana. ¡Y ahora estaba ahí! "
        "\"¡No puedo creerlo!\", exclamó mientras preparaba el aterrizaje.",
        60, 130, W - 120, tamano=13, color=white)

    numero_pagina(c, 10)
    c.showPage()

    # === PÁGINA 11: Paseo lunar ===
    # Superficie lunar
    c.setFillColor(HexColor("#D0D0D0"))
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # Cielo negro
    c.setFillColor(black)
    c.rect(0, H * 0.4, W, H * 0.6, fill=1, stroke=0)

    # Estrellas en cielo
    import random
    random.seed(1111)
    for _ in range(50):
        x = random.uniform(10, W - 10)
        y = random.uniform(H * 0.42, H - 30)
        c.setFillColor(white)
        c.circle(x, y, random.uniform(0.5, 2), fill=1, stroke=0)

    # Tierra vista desde la Luna
    c.setFillColor(AZUL_NEPTUNO)
    c.circle(100, H - 100, 50, fill=1, stroke=0)
    c.setFillColor(VERDE_PLANETA)
    c.circle(90, H - 90, 20, fill=1, stroke=0)
    c.circle(115, H - 110, 15, fill=1, stroke=0)

    # Superficie lunar con cráteres
    c.setFillColor(HexColor("#BDBDBD"))
    c.circle(100, 80, 40, fill=1, stroke=0)
    c.circle(350, 50, 30, fill=1, stroke=0)
    c.circle(500, 100, 25, fill=1, stroke=0)
    c.setFillColor(HexColor("#A0A0A0"))
    c.circle(100, 80, 30, fill=1, stroke=0)
    c.circle(350, 50, 22, fill=1, stroke=0)

    # Huellas de patitas
    c.setFillColor(HexColor("#999999"))
    for i in range(6):
        x = 150 + i * 40
        y = 170 + (i % 2) * 10
        c.ellipse(x - 5, y - 3, x + 5, y + 3, fill=1, stroke=0)
        c.circle(x - 4, y + 5, 2, fill=1, stroke=0)
        c.circle(x + 4, y + 5, 2, fill=1, stroke=0)
        c.circle(x, y + 7, 2, fill=1, stroke=0)

    # Luna la gata dando saltos (con casco)
    dibujar_luna_gata(c, 280, 220, escala=1.8, casco=True)

    # Bandera
    c.setStrokeColor(HexColor("#757575"))
    c.setLineWidth(3)
    c.line(420, 150, 420, 320)
    c.setFillColor(ROSA_NEBULOSA)
    c.rect(422, 270, 80, 45, fill=1, stroke=1)
    c.setFillColor(white)
    c.setFont(FUENTE_TITULO, 9)
    c.drawCentredString(462, 285, "LUNA")
    c.drawCentredString(462, 298, "estuvo aquí")

    # Burbuja
    c.setFillColor(white)
    c.roundRect(100, 340, 160, 40, 8, fill=1, stroke=1)
    p = c.beginPath()
    p.moveTo(200, 340)
    p.lineTo(240, 310)
    p.lineTo(220, 340)
    p.close()
    c.drawPath(p, fill=1, stroke=1)
    c.setFillColor(black)
    c.setFont(FUENTE_TITULO, 11)
    c.drawCentredString(180, 355, "¡Un pequeño paso")
    c.setFont(FUENTE_TEXTO, 10)
    c.drawCentredString(180, 343, "para una gata!")

    numero_pagina(c, 11)
    c.showPage()

    # === PÁGINA 12: Encuentro con Zip ===
    c.setFillColor(HexColor("#D0D0D0"))
    c.rect(0, 0, W, H * 0.45, fill=1, stroke=0)
    c.setFillColor(black)
    c.rect(0, H * 0.45, W, H * 0.55, fill=1, stroke=0)

    random.seed(1212)
    for _ in range(40):
        x = random.uniform(10, W - 10)
        y = random.uniform(H * 0.47, H - 30)
        c.setFillColor(white)
        c.circle(x, y, random.uniform(0.5, 2), fill=1, stroke=0)

    # Cráteres
    c.setFillColor(HexColor("#BDBDBD"))
    c.circle(80, 100, 35, fill=1, stroke=0)
    c.circle(450, 80, 25, fill=1, stroke=0)

    # Luna y Zip encontrándose
    dibujar_luna_gata(c, 180, 210, escala=1.6, casco=True, mirando="derecha")
    dibujar_zip_robot(c, 380, 200, escala=1.8)

    # Signos de exclamación
    c.setFillColor(AMARILLO_ESTRELLA)
    c.setFont(FUENTE_TITULO, 30)
    c.drawCentredString(280, 380, "!")
    c.drawCentredString(290, 400, "?")

    # Texto
    c.setFillColor(AMARILLO_ESTRELLA)
    c.setFont(FUENTE_TITULO, 16)
    c.drawCentredString(W/2, H - 40, "¡Un encuentro inesperado!")

    texto_parrafo(c,
        "Mientras exploraba un cráter, Luna escuchó un ruidito: \"¡Bip bip!\" "
        "Era un pequeño robot llamado Zip. Estaba perdido y solo. "
        "\"¡Hola!\", dijo Luna. \"¿Quieres ser mi compañero de viaje?\" "
        "Zip parpadeó sus luces LED con alegría. ¡Claro que sí!",
        60, H - 75, W - 120, tamano=12, color=white)

    numero_pagina(c, 12)
    c.showPage()

    c.save()
    print(f"  ✓ Páginas 10-12 creadas: {ruta}")

if __name__ == "__main__":
    crear("../pdfs/pag_10_12.pdf")
