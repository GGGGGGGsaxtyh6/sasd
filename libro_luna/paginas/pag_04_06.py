"""Páginas 4-6: Presentación de Luna, su sueño y el taller."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import *
from reportlab.pdfgen import canvas

def crear(ruta):
    c = canvas.Canvas(ruta, pagesize=A4)

    # === PÁGINA 4: Presentación de Luna ===
    # Fondo de pueblo nocturno
    c.setFillColor(HexColor("#1A1A40"))
    c.rect(0, 0, W, H, fill=1, stroke=0)
    fondo_espacio_seed(c, 303, HexColor("#1A1A40"))

    # Suelo
    c.setFillColor(HexColor("#2D5016"))
    c.rect(0, 0, W, 120, fill=1, stroke=0)

    # Casa de Luna
    c.setFillColor(HexColor("#8B4513"))
    c.rect(180, 120, 120, 100, fill=1, stroke=1)
    c.setFillColor(HexColor("#A0522D"))
    p = c.beginPath()
    p.moveTo(170, 220)
    p.lineTo(240, 280)
    p.lineTo(310, 220)
    p.close()
    c.drawPath(p, fill=1, stroke=1)

    # Ventana iluminada
    c.setFillColor(AMARILLO_ESTRELLA)
    c.rect(210, 150, 40, 40, fill=1, stroke=1)
    c.setStrokeColor(HexColor("#8B4513"))
    c.setLineWidth(2)
    c.line(230, 150, 230, 190)
    c.line(210, 170, 250, 170)

    # Luna (la de cielo)
    c.setFillColor(AMARILLO_ESTRELLA)
    c.circle(450, H - 120, 40, fill=1, stroke=0)
    c.setFillColor(HexColor("#1A1A40"))
    c.circle(465, H - 105, 35, fill=1, stroke=0)

    # Luna la gata sentada mirando estrellas
    dibujar_luna_gata(c, 380, 155, escala=1.5, casco=False, mirando="derecha")

    # Título del capítulo
    c.setFillColor(AMARILLO_ESTRELLA)
    c.setFont(FUENTE_TITULO, 20)
    c.drawCentredString(W/2, H - 40, "Capítulo 1")
    c.setFont(FUENTE_TITULO, 16)
    c.drawCentredString(W/2, H - 62, "La gatita que soñaba con las estrellas")

    # Texto narrativo
    texto_parrafo(c,
        "En un pequeño pueblo llamado Villa Estrella, vivía una gatita gris llamada Luna. "
        "Tenía los ojos verdes como esmeraldas y una curiosidad más grande que el universo.",
        60, H - 100, W - 120, tamano=13, color=white)

    numero_pagina(c, 4)
    c.showPage()

    # === PÁGINA 5: Luna mira el cielo ===
    fondo_espacio_seed(c, 404, AZUL_NOCHE)

    # Ventana grande
    c.setFillColor(HexColor("#5D4037"))
    c.roundRect(80, 200, 430, 450, 15, fill=1, stroke=1)
    c.setFillColor(AZUL_ESPACIO)
    c.roundRect(95, 215, 400, 420, 10, fill=1, stroke=0)

    # Estrellas por la ventana
    import random
    random.seed(505)
    for _ in range(30):
        x = random.uniform(100, 490)
        y = random.uniform(220, 630)
        c.setFillColor(AMARILLO_ESTRELLA)
        c.circle(x, y, random.uniform(1, 3), fill=1, stroke=0)

    # Luna sentada en el alféizar
    dibujar_luna_gata(c, 295, 230, escala=1.8, casco=False, mirando="derecha")

    # Texto
    texto_parrafo(c,
        "Cada noche, Luna se sentaba en la ventana y miraba las estrellas durante horas. "
        "\"¿Qué habrá allá arriba?\", se preguntaba. \"¿Habrá otros gatos en el espacio? "
        "¿Los planetas serán de queso?\"",
        60, 180, W - 120, tamano=13, color=white)

    # Burbuja de pensamiento
    c.setFillColor(HexColor("#FFFFFF30"))
    c.circle(420, 420, 40, fill=1, stroke=0)
    c.circle(440, 470, 15, fill=1, stroke=0)
    c.circle(430, 450, 8, fill=1, stroke=0)

    # Planeta de queso en la burbuja
    c.setFillColor(AMARILLO_ESTRELLA)
    c.circle(420, 420, 25, fill=1, stroke=0)
    c.setFillColor(HexColor("#DAA520"))
    c.circle(410, 425, 5, fill=1, stroke=0)
    c.circle(430, 415, 3, fill=1, stroke=0)
    c.circle(420, 435, 4, fill=1, stroke=0)

    numero_pagina(c, 5)
    c.showPage()

    # === PÁGINA 6: El taller secreto ===
    c.setFillColor(HexColor("#3E2723"))
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # Suelo del taller
    c.setFillColor(HexColor("#4E342E"))
    c.rect(0, 0, W, 150, fill=1, stroke=0)

    # Mesa de trabajo
    c.setFillColor(HexColor("#795548"))
    c.rect(100, 150, 350, 15, fill=1, stroke=1)
    c.rect(120, 80, 15, 70, fill=1, stroke=1)
    c.rect(410, 80, 15, 70, fill=1, stroke=1)

    # Herramientas en la mesa
    c.setFillColor(HexColor("#B0BEC5"))
    c.rect(150, 168, 40, 8, fill=1, stroke=1)  # llave
    c.setFillColor(red)
    c.rect(250, 168, 30, 12, fill=1, stroke=1)  # caja
    c.setFillColor(CYAN_HIELO)
    c.rect(340, 165, 50, 30, fill=1, stroke=1)  # pantalla

    # Planos de cohete en la pared
    c.setFillColor(HexColor("#E3F2FD"))
    c.rect(60, 400, 180, 130, fill=1, stroke=1)
    c.setStrokeColor(AZUL_NEPTUNO)
    c.setLineWidth(1)
    # Dibujo de cohete en los planos
    c.line(150, 420, 150, 510)
    c.line(130, 420, 170, 420)
    c.line(130, 420, 150, 510)
    c.line(170, 420, 150, 510)
    c.setFillColor(AZUL_NEPTUNO)
    c.setFont(FUENTE_TEXTO, 8)
    c.drawString(80, 540, "COHETE ESTELAR MK-1")

    # Bombilla colgante
    c.setStrokeColor(black)
    c.setLineWidth(1)
    c.line(W/2, H, W/2, H - 80)
    c.setFillColor(AMARILLO_ESTRELLA)
    c.circle(W/2, H - 95, 15, fill=1, stroke=1)

    # Resplandor de la bombilla
    c.setFillColor(HexColor("#FFEB3B20"))
    c.circle(W/2, H - 95, 60, fill=1, stroke=0)

    # Luna trabajando
    dibujar_luna_gata(c, 300, 200, escala=1.5, casco=False, mirando="izquierda")

    # Título
    c.setFillColor(AMARILLO_ESTRELLA)
    c.setFont(FUENTE_TITULO, 18)
    c.drawCentredString(W/2, H - 40, "El taller secreto")

    texto_parrafo(c,
        "Luna no solo soñaba. ¡También construía! En su taller secreto del sótano, "
        "llevaba meses trabajando en algo increíble: ¡su propio cohete espacial! "
        "Lo llamó \"El Bigotes Estelar\".",
        60, H - 75, W - 120, tamano=13, color=white)

    numero_pagina(c, 6)
    c.showPage()

    c.save()
    print(f"  ✓ Páginas 4-6 creadas: {ruta}")

if __name__ == "__main__":
    crear("../pdfs/pag_04_06.pdf")
