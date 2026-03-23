"""Páginas 1-3: Portada, página de título y dedicatoria."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import *
from reportlab.pdfgen import canvas

def crear(ruta):
    c = canvas.Canvas(ruta, pagesize=A4)

    # === PÁGINA 1: PORTADA ===
    fondo_espacio(c, MORADO_ESPACIO)

    # Planeta grande decorativo
    dibujar_planeta(c, 450, 650, 60, NARANJA_SATURNO, AMARILLO_ESTRELLA, anillos=True)
    dibujar_planeta(c, 80, 200, 25, ROJO_MARTE, ARENA_MARTE)
    dibujar_planeta(c, 520, 300, 20, AZUL_NEPTUNO)

    # Estrellas grandes decorativas
    for x, y, r in [(100, 700, 12), (480, 500, 10), (350, 150, 8), (150, 400, 9)]:
        dibujar_estrella(c, x, y, r)

    # Luna la gata en el centro
    dibujar_luna_gata(c, W/2, H/2 - 40, escala=2.5, casco=True)

    # Título
    c.setFillColor(AMARILLO_ESTRELLA)
    c.setFont(FUENTE_TITULO, 36)
    c.drawCentredString(W/2, H - 80, "Las Aventuras de")
    c.setFont(FUENTE_TITULO, 44)
    c.drawCentredString(W/2, H - 130, "LUNA")
    c.setFont(FUENTE_TITULO, 28)
    c.drawCentredString(W/2, H - 165, "La Gata Espacial")

    # Subtítulo
    c.setFillColor(white)
    c.setFont(FUENTE_ITALIC, 16)
    c.drawCentredString(W/2, 60, "Un libro de dibujos animados")

    c.showPage()

    # === PÁGINA 2: TÍTULO INTERIOR ===
    fondo_espacio_seed(c, 101, AZUL_OSCURO)

    c.setFillColor(AMARILLO_ESTRELLA)
    c.setFont(FUENTE_TITULO, 30)
    c.drawCentredString(W/2, H - 200, "Las Aventuras de")
    c.setFont(FUENTE_TITULO, 42)
    c.drawCentredString(W/2, H - 250, "LUNA")
    c.setFont(FUENTE_TITULO, 24)
    c.drawCentredString(W/2, H - 285, "La Gata Espacial")

    # Línea decorativa
    c.setStrokeColor(AMARILLO_ESTRELLA)
    c.setLineWidth(2)
    c.line(W/2 - 100, H - 300, W/2 + 100, H - 300)

    c.setFillColor(white)
    c.setFont(FUENTE_TEXTO, 14)
    c.drawCentredString(W/2, H - 340, "Escrito e ilustrado por")
    c.setFont(FUENTE_TITULO, 18)
    c.drawCentredString(W/2, H - 365, "Un Agente de IA Creativo")

    c.setFont(FUENTE_TEXTO, 12)
    c.drawCentredString(W/2, 120, "Primera Edición — 2026")
    c.drawCentredString(W/2, 100, "Todos los derechos reservados para los soñadores")

    dibujar_estrella(c, W/2, H/2 - 30, 25, AMARILLO_ESTRELLA)
    numero_pagina(c, 2)
    c.showPage()

    # === PÁGINA 3: DEDICATORIA ===
    fondo_espacio_seed(c, 202, AZUL_NOCHE)

    c.setFillColor(AMARILLO_ESTRELLA)
    c.setFont(FUENTE_TITULO, 22)
    c.drawCentredString(W/2, H - 200, "Dedicatoria")

    c.setStrokeColor(AMARILLO_ESTRELLA)
    c.setLineWidth(1)
    c.line(W/2 - 60, H - 215, W/2 + 60, H - 215)

    c.setFillColor(white)
    c.setFont(FUENTE_ITALIC, 16)
    c.drawCentredString(W/2, H - 270, "Para todos los que miran las estrellas")
    c.drawCentredString(W/2, H - 295, "y se preguntan qué hay más allá.")
    c.drawCentredString(W/2, H - 335, "Para los curiosos, los soñadores,")
    c.drawCentredString(W/2, H - 360, "y los que nunca dejan de explorar.")

    c.setFont(FUENTE_ITALIC, 14)
    c.setFillColor(ROSA_NEBULOSA)
    c.drawCentredString(W/2, H - 420, "— Y especialmente para ti, que estás leyendo esto. —")

    dibujar_luna_gata(c, W/2, 180, escala=1.5, casco=False)
    dibujar_estrella(c, 100, 500, 10)
    dibujar_estrella(c, 480, 450, 8)
    dibujar_estrella(c, 200, 300, 7)

    numero_pagina(c, 3)
    c.showPage()

    c.save()
    print(f"  ✓ Páginas 1-3 creadas: {ruta}")

if __name__ == "__main__":
    crear("../pdfs/pag_01_03.pdf")
