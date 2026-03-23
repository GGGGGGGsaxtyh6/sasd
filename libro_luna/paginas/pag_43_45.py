"""Páginas 43-45: La Tierra a lo lejos, aterrizaje, reencuentro con el pueblo."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import *
from reportlab.pdfgen import canvas
import random, math

def crear(ruta):
    c = canvas.Canvas(ruta, pagesize=A4)

    # === PÁGINA 43: La Tierra a lo lejos ===
    fondo_espacio_seed(c, 4343, AZUL_ESPACIO)

    # La Tierra! Apareciendo hermosa
    # Halo azul
    c.setFillColor(HexColor("#2196F320"))
    c.circle(W/2, H/2, 170, fill=1, stroke=0)
    c.setFillColor(HexColor("#2196F340"))
    c.circle(W/2, H/2, 145, fill=1, stroke=0)

    # Tierra
    c.setFillColor(AZUL_NEPTUNO)
    c.circle(W/2, H/2, 120, fill=1, stroke=0)

    # Continentes
    c.setFillColor(VERDE_PLANETA)
    # Europa/África
    c.ellipse(W/2 - 20, H/2 - 30, W/2 + 30, H/2 + 60, fill=1, stroke=0)
    # América
    c.ellipse(W/2 - 80, H/2 - 40, W/2 - 30, H/2 + 80, fill=1, stroke=0)
    # Asia
    c.ellipse(W/2 + 30, H/2 + 10, W/2 + 90, H/2 + 70, fill=1, stroke=0)

    # Nubes
    c.setFillColor(HexColor("#FFFFFF40"))
    c.ellipse(W/2 - 60, H/2 + 60, W/2 + 20, H/2 + 80, fill=1, stroke=0)
    c.ellipse(W/2 + 20, H/2 - 50, W/2 + 80, H/2 - 30, fill=1, stroke=0)

    # Ventana del cohete (marco)
    c.setStrokeColor(HexColor("#546E7A"))
    c.setLineWidth(8)
    c.circle(W/2, H/2, 200, fill=0, stroke=1)

    # Remaches de la ventana
    for angle in range(0, 360, 30):
        rx = W/2 + 200 * math.cos(math.radians(angle))
        ry = H/2 + 200 * math.sin(math.radians(angle))
        c.setFillColor(HexColor("#78909C"))
        c.circle(rx, ry, 4, fill=1, stroke=0)

    texto_parrafo(c,
        "Y entonces la vio. La Tierra. Su hogar. Azul y verde, con nubes blancas como "
        "algodón. Era el planeta más bonito de todos. A Luna se le llenaron los ojos "
        "de lágrimas. \"Hogar...\", susurró.",
        60, H - 50, W - 120, tamano=13, color=white)

    numero_pagina(c, 43)
    c.showPage()

    # === PÁGINA 44: Aterrizaje ===
    # Cielo con amanecer
    # Gradiente simulado
    for i in range(20):
        y = i * H / 20
        r = int(30 + i * 10)
        g = int(20 + i * 8)
        b = int(80 + i * 5)
        c.setFillColor(HexColor(f"#{min(r,255):02x}{min(g,255):02x}{min(b,255):02x}"))
        c.rect(0, y, W, H / 20 + 1, fill=1, stroke=0)

    # Sol naciente
    c.setFillColor(NARANJA_SOL)
    c.circle(W/2, H - 50, 60, fill=1, stroke=0)
    c.setFillColor(HexColor("#FF8C4240"))
    c.circle(W/2, H - 50, 100, fill=1, stroke=0)

    # Suelo verde
    c.setFillColor(HexColor("#2E7D32"))
    c.rect(0, 0, W, 120, fill=1, stroke=0)
    c.setFillColor(HexColor("#1B5E20"))
    # Colinas
    c.circle(100, 120, 80, fill=1, stroke=0)
    c.circle(300, 120, 60, fill=1, stroke=0)
    c.circle(500, 120, 70, fill=1, stroke=0)

    # Cohete aterrizando con humo
    dibujar_cohete(c, W/2, 280, escala=2.0)

    # Nubes de aterrizaje
    for i in range(6):
        c.setFillColor(HexColor(f"#FFFFFF{50 + i * 10:02x}"))
        x = W/2 + (i - 3) * 40
        c.circle(x, 130, 25, fill=1, stroke=0)

    c.setFillColor(AMARILLO_ESTRELLA)
    c.setFont(FUENTE_TITULO, 24)
    c.drawCentredString(W/2, H - 130, "¡ATERRIZAJE!")

    texto_parrafo(c,
        "Con el sol naciendo en el horizonte, el Bigotes Estelar aterrizó suavemente "
        "en la pradera junto a Villa Estrella. El cohete tocó el suelo y Luna suspiró "
        "de alivio. ¡Estaban en casa!",
        60, H - 160, W - 120, tamano=13, color=white)

    numero_pagina(c, 44)
    c.showPage()

    # === PÁGINA 45: El pueblo los recibe ===
    # Cielo azul con nubes
    c.setFillColor(HexColor("#64B5F6"))
    c.rect(0, H * 0.3, W, H * 0.7, fill=1, stroke=0)

    # Nubes
    c.setFillColor(white)
    c.circle(100, H - 80, 30, fill=1, stroke=0)
    c.circle(130, H - 80, 40, fill=1, stroke=0)
    c.circle(160, H - 80, 25, fill=1, stroke=0)
    c.circle(400, H - 120, 35, fill=1, stroke=0)
    c.circle(435, H - 120, 30, fill=1, stroke=0)

    # Suelo
    c.setFillColor(HexColor("#4CAF50"))
    c.rect(0, 0, W, H * 0.3, fill=1, stroke=0)

    # Casas del pueblo
    for i, x in enumerate([60, 180, 370, 470]):
        colores_casa = [HexColor("#E65100"), HexColor("#1565C0"), HexColor("#6A1B9A"), HexColor("#2E7D32")]
        c.setFillColor(colores_casa[i])
        c.rect(x, H * 0.3, 60, 50, fill=1, stroke=1)
        c.setFillColor(HexColor("#5D4037"))
        # Techo
        p = c.beginPath()
        p.moveTo(x - 5, H * 0.3 + 50)
        p.lineTo(x + 30, H * 0.3 + 80)
        p.lineTo(x + 65, H * 0.3 + 50)
        p.close()
        c.drawPath(p, fill=1, stroke=1)
        # Ventana
        c.setFillColor(AMARILLO_ESTRELLA)
        c.rect(x + 20, H * 0.3 + 15, 20, 20, fill=1, stroke=1)

    # Luna y Zip en el centro con vecinos
    dibujar_luna_gata(c, W/2, H * 0.3 + 30, escala=1.5, casco=False)
    dibujar_zip_robot(c, W/2 + 60, H * 0.3 + 20, escala=1.0)

    # Confeti
    random.seed(4545)
    for _ in range(40):
        x = random.uniform(50, W - 50)
        y = random.uniform(H * 0.4, H - 40)
        color = random.choice([red, AMARILLO_ESTRELLA, VERDE_ALIEN, ROSA_NEBULOSA, CYAN_HIELO])
        c.setFillColor(color)
        c.rect(x, y, 4, 8, fill=1, stroke=0)

    # Pancarta
    c.setFillColor(white)
    c.roundRect(120, H * 0.6, 350, 50, 10, fill=1, stroke=1)
    c.setFillColor(HexColor("#E65100"))
    c.setFont(FUENTE_TITULO, 18)
    c.drawCentredString(295, H * 0.6 + 15, "¡BIENVENIDA A CASA, LUNA!")

    texto_parrafo(c,
        "¡Todo el pueblo había salido a recibirla! Había una pancarta, confeti "
        "y hasta un pastel en forma de cohete. Luna estaba feliz de volver, "
        "pero sobre todo, feliz de tener tantas historias que contar.",
        60, H - 50, W - 120, tamano=12, color=HexColor("#1A237E"))

    numero_pagina(c, 45)
    c.showPage()

    c.save()
    print(f"  ✓ Páginas 43-45 creadas: {ruta}")

if __name__ == "__main__":
    crear("../pdfs/pag_43_45.pdf")
