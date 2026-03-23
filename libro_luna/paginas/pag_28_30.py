"""Páginas 28-30: Urano el planeta de lado, Neptuno, tormentas de Neptuno."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import *
from reportlab.pdfgen import canvas
import random, math

def crear(ruta):
    c = canvas.Canvas(ruta, pagesize=A4)

    # === PÁGINA 28: Urano ===
    fondo_espacio_seed(c, 2828, HexColor("#050520"))

    # Urano (de lado) - planeta azul verdoso
    c.setFillColor(CYAN_HIELO)
    c.circle(W/2, H/2, 140, fill=1, stroke=0)

    # Anillos verticales (Urano gira de lado)
    c.setStrokeColor(HexColor("#80DEEA"))
    c.setLineWidth(3)
    c.ellipse(W/2 - 20, H/2 - 200, W/2 + 20, H/2 + 200, fill=0, stroke=1)
    c.setStrokeColor(HexColor("#4DD0E1"))
    c.setLineWidth(2)
    c.ellipse(W/2 - 30, H/2 - 210, W/2 + 30, H/2 + 210, fill=0, stroke=1)

    # Gradiente en Urano
    c.setFillColor(HexColor("#00695C"))
    c.circle(W/2 + 30, H/2 - 20, 60, fill=1, stroke=0)
    c.setFillColor(HexColor("#00BCD450"))
    c.circle(W/2 - 40, H/2 + 30, 80, fill=1, stroke=0)

    # Cohete
    dibujar_cohete(c, 100, H/2, escala=0.9)

    # Burbuja de Luna
    c.setFillColor(white)
    c.roundRect(50, H/2 + 100, 180, 45, 8, fill=1, stroke=1)
    c.setFillColor(black)
    c.setFont(FUENTE_TITULO, 11)
    c.drawCentredString(140, H/2 + 125, "¡Este planeta gira")
    c.drawCentredString(140, H/2 + 110, "¡tumbado de lado!")

    texto_parrafo(c,
        "Urano era un planeta muy especial: ¡giraba tumbado de lado! Como una peonza "
        "acostada. Además, era de un azul verdoso precioso. \"¡Es el planeta más raro "
        "que he visto!\", maulló Luna. Zip calculó que la temperatura era de -224°C. "
        "\"¡Mejor nos quedamos dentro del cohete!\"",
        60, H - 50, W - 120, tamano=12, color=white)

    numero_pagina(c, 28)
    c.showPage()

    # === PÁGINA 29: Neptuno ===
    fondo_espacio_seed(c, 2929, HexColor("#030318"))

    # Neptuno - azul intenso
    c.setFillColor(AZUL_NEPTUNO)
    c.circle(W/2, H/2 - 50, 160, fill=1, stroke=0)

    # Nubes/bandas de Neptuno
    c.setFillColor(HexColor("#1565C0"))
    c.ellipse(W/2 - 120, H/2 - 30, W/2 + 100, H/2 + 10, fill=1, stroke=0)
    c.setFillColor(HexColor("#0D47A1"))
    c.ellipse(W/2 - 80, H/2 - 100, W/2 + 130, H/2 - 60, fill=1, stroke=0)

    # Gran Mancha Oscura
    c.setFillColor(HexColor("#0A1E3E"))
    c.ellipse(W/2 + 20, H/2 - 80, W/2 + 90, H/2 - 40, fill=1, stroke=0)

    # Tritón (luna de Neptuno)
    c.setFillColor(HexColor("#ECEFF1"))
    c.circle(120, 200, 25, fill=1, stroke=1)
    c.setFillColor(HexColor("#B0BEC5"))
    c.circle(115, 205, 5, fill=1, stroke=0)
    c.circle(128, 195, 4, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont(FUENTE_TEXTO, 9)
    c.drawCentredString(120, 168, "Tritón")

    # Cohete
    dibujar_cohete(c, 450, H - 180, escala=0.8)

    c.setFillColor(AMARILLO_ESTRELLA)
    c.setFont(FUENTE_TITULO, 18)
    c.drawCentredString(W/2, H - 40, "El último planeta: Neptuno")

    texto_parrafo(c,
        "Neptuno era el planeta más lejano del Sol. Azul oscuro y misterioso. "
        "\"Parece el fondo del mar\", dijo Luna. Tenía los vientos más fuertes "
        "del sistema solar: ¡más de 2.000 km por hora!",
        60, 120, W - 120, tamano=13, color=white)

    numero_pagina(c, 29)
    c.showPage()

    # === PÁGINA 30: La tormenta de Neptuno ===
    fondo_espacio_seed(c, 3030, HexColor("#0A1A40"))

    # Vientos y remolinos
    c.setFillColor(HexColor("#1565C0"))
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # Remolinos de viento
    for j in range(3):
        random.seed(3030 + j)
        cx_v = random.uniform(100, W - 100)
        cy_v = random.uniform(200, H - 200)
        for i in range(30):
            angle = i * 0.4 + j
            r = 5 + i * 3
            x = cx_v + r * math.cos(angle)
            y = cy_v + r * math.sin(angle)
            c.setFillColor(HexColor(f"#{'1565C0' if i % 2 == 0 else '0D47A1'}"))
            c.circle(x, y, 8, fill=1, stroke=0)

    # Rayos
    c.setStrokeColor(AMARILLO_ESTRELLA)
    c.setLineWidth(3)
    rayos = [(100, H-200, 130, H-260, 110, H-250, 140, H-310),
             (400, H-150, 420, H-210, 405, H-200, 430, H-270)]
    for r in rayos:
        p = c.beginPath()
        p.moveTo(r[0], r[1])
        p.lineTo(r[2], r[3])
        p.lineTo(r[4], r[5])
        p.lineTo(r[6], r[7])
        c.drawPath(p, fill=0, stroke=1)

    # Cohete sacudido
    c.saveState()
    c.translate(W/2, H/2)
    c.rotate(20)
    dibujar_cohete(c, 0, 0, escala=1.5)
    c.restoreState()

    # Onomatopeyas
    c.setFillColor(white)
    c.setFont(FUENTE_TITULO, 28)
    c.saveState()
    c.translate(80, 400)
    c.rotate(10)
    c.drawString(0, 0, "¡ZZZUUM!")
    c.restoreState()

    c.setFillColor(CYAN_HIELO)
    c.setFont(FUENTE_TITULO, 22)
    c.saveState()
    c.translate(350, 200)
    c.rotate(-15)
    c.drawString(0, 0, "¡FIUUU!")
    c.restoreState()

    texto_parrafo(c,
        "¡Los vientos de Neptuno eran una locura! El Bigotes Estelar giraba como una "
        "lavadora. \"¡Miau miau miaaau!\" gritaba Luna. Zip se había magnetizado "
        "al suelo para no salir volando. ¡Tenían que salir de ahí rápido!",
        60, 140, W - 120, tamano=12, color=white)

    numero_pagina(c, 30)
    c.showPage()

    c.save()
    print(f"  ✓ Páginas 28-30 creadas: {ruta}")

if __name__ == "__main__":
    crear("../pdfs/pag_28_30.pdf")
