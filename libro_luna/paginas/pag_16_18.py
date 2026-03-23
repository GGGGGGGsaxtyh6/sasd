"""Páginas 16-18: Explorando Marte, volcán marciano, amigo marciano."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import *
from reportlab.pdfgen import canvas
import random

def crear(ruta):
    c = canvas.Canvas(ruta, pagesize=A4)

    # === PÁGINA 16: Superficie de Marte ===
    # Cielo marciano (rosado)
    c.setFillColor(HexColor("#FFB74D"))
    c.rect(0, H * 0.35, W, H * 0.65, fill=1, stroke=0)
    # Suelo rojo
    c.setFillColor(ROJO_MARTE)
    c.rect(0, 0, W, H * 0.35, fill=1, stroke=0)

    # Montañas marcianas
    c.setFillColor(HexColor("#8B3A0A"))
    p = c.beginPath()
    p.moveTo(0, H * 0.35)
    p.lineTo(80, H * 0.55)
    p.lineTo(160, H * 0.35)
    p.lineTo(250, H * 0.5)
    p.lineTo(350, H * 0.35)
    p.lineTo(420, H * 0.45)
    p.lineTo(500, H * 0.35)
    p.lineTo(W, H * 0.4)
    p.lineTo(W, H * 0.35)
    p.close()
    c.drawPath(p, fill=1, stroke=0)

    # Rocas
    c.setFillColor(HexColor("#6D2B0A"))
    c.ellipse(50, 80, 110, 130, fill=1, stroke=0)
    c.ellipse(400, 60, 460, 100, fill=1, stroke=0)
    c.ellipse(250, 50, 290, 80, fill=1, stroke=0)

    # Sol marciano (más pequeño)
    c.setFillColor(HexColor("#FFF9C4"))
    c.circle(450, H - 80, 30, fill=1, stroke=0)

    # Luna y Zip caminando
    dibujar_luna_gata(c, 200, H * 0.37 + 20, escala=1.5, casco=True, mirando="derecha")
    dibujar_zip_robot(c, 320, H * 0.37 + 10, escala=1.3)

    # Huellas en la arena marciana
    c.setFillColor(HexColor("#8B3A0A"))
    for i in range(4):
        x = 80 + i * 30
        y = H * 0.35 - 10
        c.ellipse(x - 4, y - 2, x + 4, y + 2, fill=1, stroke=0)

    texto_parrafo(c,
        "La superficie de Marte era como un desierto rojo gigante. El cielo tenía un color "
        "anaranjado precioso. Luna saltaba de roca en roca mientras Zip escaneaba todo "
        "con sus sensores. \"¡Esto es alucinante!\" maulló Luna.",
        60, H - 50, W - 120, tamano=13, color=HexColor("#3E2723"))

    numero_pagina(c, 16)
    c.showPage()

    # === PÁGINA 17: El gran volcán Olympus ===
    # Cielo marciano
    c.setFillColor(HexColor("#E65100"))
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # Monte Olimpo gigante
    c.setFillColor(HexColor("#5D4037"))
    p2 = c.beginPath()
    p2.moveTo(-50, 0)
    p2.lineTo(W/2, H * 0.75)
    p2.lineTo(W + 50, 0)
    p2.close()
    c.drawPath(p2, fill=1, stroke=0)

    # Cráter en la cima
    c.setFillColor(HexColor("#3E2723"))
    c.ellipse(W/2 - 40, H * 0.72, W/2 + 40, H * 0.78, fill=1, stroke=0)

    # Humo/vapor
    c.setFillColor(HexColor("#FFFFFF30"))
    c.circle(W/2 - 10, H * 0.82, 25, fill=1, stroke=0)
    c.circle(W/2 + 15, H * 0.85, 20, fill=1, stroke=0)
    c.circle(W/2, H * 0.88, 15, fill=1, stroke=0)

    # Luna y Zip abajo mirando hacia arriba
    dibujar_luna_gata(c, 150, 130, escala=1.2, casco=True)
    dibujar_zip_robot(c, 230, 120, escala=1.0)

    # Burbuja de asombro
    c.setFillColor(white)
    c.roundRect(80, 250, 160, 40, 8, fill=1, stroke=1)
    p3 = c.beginPath()
    p3.moveTo(140, 250)
    p3.lineTo(160, 220)
    p3.lineTo(170, 250)
    p3.close()
    c.drawPath(p3, fill=1, stroke=1)
    c.setFillColor(black)
    c.setFont(FUENTE_TITULO, 11)
    c.drawCentredString(160, 265, "¡Es ENORME!")
    c.setFont(FUENTE_TEXTO, 9)
    c.drawCentredString(160, 253, "¡El volcán más grande!")

    texto_parrafo(c,
        "Frente a ellos se alzaba el Monte Olimpo, el volcán más grande del sistema solar. "
        "¡Era tres veces más alto que el Monte Everest! Luna tuvo que estirar mucho el cuello "
        "para ver la cima. \"¡Bip bip bip!\" Zip sacaba fotos sin parar.",
        60, H - 40, W - 120, tamano=12, color=AMARILLO_ESTRELLA)

    numero_pagina(c, 17)
    c.showPage()

    # === PÁGINA 18: El marcianito Rojo ===
    c.setFillColor(HexColor("#FFB74D"))
    c.rect(0, H * 0.3, W, H * 0.7, fill=1, stroke=0)
    c.setFillColor(ROJO_MARTE)
    c.rect(0, 0, W, H * 0.3, fill=1, stroke=0)

    # Cueva marciana
    c.setFillColor(HexColor("#5D4037"))
    c.ellipse(300, H * 0.25, 520, H * 0.55, fill=1, stroke=0)
    c.setFillColor(HexColor("#3E2723"))
    c.ellipse(320, H * 0.27, 500, H * 0.5, fill=1, stroke=0)

    # Marcianito Rojo (amigo)
    cx_m, cy_m = 410, H * 0.38
    s = 1.5
    # Cuerpo
    c.setFillColor(VERDE_ALIEN)
    c.ellipse(cx_m - 15*s, cy_m - 20*s, cx_m + 15*s, cy_m + 10*s, fill=1, stroke=1)
    # Cabeza
    c.circle(cx_m, cy_m + 20*s, 15*s, fill=1, stroke=1)
    # Ojos grandes
    c.setFillColor(black)
    c.ellipse(cx_m - 10*s, cy_m + 15*s, cx_m - 2*s, cy_m + 28*s, fill=1, stroke=0)
    c.ellipse(cx_m + 2*s, cy_m + 15*s, cx_m + 10*s, cy_m + 28*s, fill=1, stroke=0)
    c.setFillColor(white)
    c.circle(cx_m - 5*s, cy_m + 24*s, 2*s, fill=1, stroke=0)
    c.circle(cx_m + 7*s, cy_m + 24*s, 2*s, fill=1, stroke=0)
    # Antenas
    c.setStrokeColor(VERDE_ALIEN)
    c.setLineWidth(2)
    c.line(cx_m - 5*s, cy_m + 35*s, cx_m - 12*s, cy_m + 48*s)
    c.line(cx_m + 5*s, cy_m + 35*s, cx_m + 12*s, cy_m + 48*s)
    c.setFillColor(AMARILLO_ESTRELLA)
    c.circle(cx_m - 12*s, cy_m + 48*s, 3*s, fill=1, stroke=0)
    c.circle(cx_m + 12*s, cy_m + 48*s, 3*s, fill=1, stroke=0)
    # Sonrisa
    c.setStrokeColor(black)
    c.setLineWidth(1)
    p4 = c.beginPath()
    p4.moveTo(cx_m - 6*s, cy_m + 13*s)
    p4.curveTo(cx_m - 3*s, cy_m + 8*s, cx_m + 3*s, cy_m + 8*s, cx_m + 6*s, cy_m + 13*s)
    c.drawPath(p4, fill=0, stroke=1)

    # Luna y Zip saludando
    dibujar_luna_gata(c, 180, H * 0.32 + 20, escala=1.4, casco=True, mirando="derecha")
    dibujar_zip_robot(c, 260, H * 0.32 + 10, escala=1.1)

    # Texto
    c.setFillColor(HexColor("#3E2723"))
    c.setFont(FUENTE_TITULO, 16)
    c.drawCentredString(W/2, H - 40, "¡Un nuevo amigo!")

    texto_parrafo(c,
        "Cerca de una cueva, encontraron a un simpático marcianito verde llamado Rojo. "
        "\"¿Por qué te llamas Rojo si eres verde?\" preguntó Luna. "
        "\"Porque vivo en el planeta rojo, ¡obvio!\" contestó riendo. "
        "Rojo les regaló una piedra marciana de recuerdo.",
        60, H - 65, W - 120, tamano=12, color=HexColor("#3E2723"))

    numero_pagina(c, 18)
    c.showPage()

    c.save()
    print(f"  ✓ Páginas 16-18 creadas: {ruta}")

if __name__ == "__main__":
    crear("../pdfs/pag_16_18.pdf")
