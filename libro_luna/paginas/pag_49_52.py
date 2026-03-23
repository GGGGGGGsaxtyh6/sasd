"""Páginas 49-52: Epílogo, mensaje final, página de colorear, contraportada."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import *
from reportlab.pdfgen import canvas
import random, math

def crear(ruta):
    c = canvas.Canvas(ruta, pagesize=A4)

    # === PÁGINA 49: Epílogo - El nuevo sueño ===
    fondo_espacio_seed(c, 4949, MORADO_ESPACIO)

    # Luna acostada en su cama soñando
    # Cama
    c.setFillColor(HexColor("#7B1FA2"))
    c.roundRect(120, 100, 250, 30, 8, fill=1, stroke=1)
    c.setFillColor(HexColor("#9C27B0"))
    c.roundRect(120, 130, 250, 60, 5, fill=1, stroke=1)
    # Almohada
    c.setFillColor(white)
    c.roundRect(130, 150, 60, 30, 10, fill=1, stroke=1)

    # Luna durmiendo
    c.setFillColor(GRIS_LUNA_GATA)
    c.ellipse(145, 145, 200, 185, fill=1, stroke=0)
    # Ojitos cerrados
    c.setStrokeColor(black)
    c.setLineWidth(1.5)
    c.line(160, 170, 170, 167)
    c.line(175, 170, 185, 167)

    # Burbuja de sueño grande
    c.setFillColor(HexColor("#FFFFFF15"))
    c.circle(350, 450, 120, fill=1, stroke=0)
    c.setFillColor(HexColor("#FFFFFF10"))
    c.circle(280, 320, 30, fill=1, stroke=0)
    c.circle(310, 370, 15, fill=1, stroke=0)

    # Dentro del sueño: Luna con alas volando
    # Mini Luna con alas
    c.setFillColor(GRIS_LUNA_GATA)
    c.circle(350, 460, 12, fill=1, stroke=1)
    c.setFillColor(VERDE_OJOS)
    c.circle(346, 463, 2, fill=1, stroke=0)
    c.circle(354, 463, 2, fill=1, stroke=0)
    # Alas
    c.setFillColor(HexColor("#E1BEE750"))
    c.ellipse(325, 455, 345, 480, fill=1, stroke=0)
    c.ellipse(355, 455, 375, 480, fill=1, stroke=0)

    # Estrellas en el sueño
    for x, y, r in [(310, 500, 6), (380, 490, 5), (340, 520, 4), (370, 430, 5)]:
        dibujar_estrella(c, x, y, r, AMARILLO_ESTRELLA)

    # Zip dormido al lado (luces apagadas)
    c.setFillColor(HexColor("#78909C"))
    c.roundRect(380, 110, 30, 40, 8, fill=1, stroke=1)
    c.setFillColor(HexColor("#455A64"))
    c.roundRect(385, 130, 8, 8, 2, fill=1, stroke=0)
    c.roundRect(397, 130, 8, 8, 2, fill=1, stroke=0)
    # Zzz
    c.setFillColor(CYAN_HIELO)
    c.setFont(FUENTE_ITALIC, 10)
    c.drawString(405, 160, "zzz")

    c.setFillColor(AMARILLO_ESTRELLA)
    c.setFont(FUENTE_TITULO, 18)
    c.drawCentredString(W/2, H - 40, "Epílogo")
    c.setFont(FUENTE_TITULO, 14)
    c.drawCentredString(W/2, H - 62, "Un nuevo sueño")

    texto_parrafo(c,
        "Esa noche, Luna soñó que volaba entre las estrellas, pero esta vez sin cohete. "
        "Con alas hechas de luz estelar. Y supo que algún día volvería al espacio. "
        "Porque una gata aventurera nunca deja de soñar.",
        60, H - 90, W - 120, tamano=13, color=white)

    numero_pagina(c, 49)
    c.showPage()

    # === PÁGINA 50: Mensaje para el lector ===
    fondo_espacio_seed(c, 5050, AZUL_OSCURO)

    # Marco bonito
    c.setStrokeColor(AMARILLO_ESTRELLA)
    c.setLineWidth(3)
    c.roundRect(60, 150, W - 120, H - 250, 20, fill=0, stroke=1)

    # Estrella grande arriba
    dibujar_estrella(c, W/2, H - 130, 30, AMARILLO_ESTRELLA)

    c.setFillColor(AMARILLO_ESTRELLA)
    c.setFont(FUENTE_TITULO, 22)
    c.drawCentredString(W/2, H - 200, "Mensaje para ti")

    c.setFillColor(white)
    c.setFont(FUENTE_ITALIC, 15)
    lineas = [
        "Querido lector, querida lectora:",
        "",
        "El universo es enorme y misterioso,",
        "pero no tienes que ir al espacio",
        "para vivir grandes aventuras.",
        "",
        "Cada libro que lees es un cohete.",
        "Cada pregunta que haces es una estrella.",
        "Cada amigo que encuentras es un planeta",
        "nuevo por descubrir.",
        "",
        "Nunca dejes de ser curioso.",
        "Nunca dejes de soñar.",
        "Nunca dejes de explorar.",
        "",
        "El universo está esperándote.",
        "",
        "Con cariño,",
        "Luna, Zip y los Blobitos ♥",
    ]
    y = H - 250
    for linea in lineas:
        if linea:
            c.drawCentredString(W/2, y, linea)
        y -= 22

    # Mini dibujos en las esquinas
    dibujar_estrella(c, 90, 180, 12, AMARILLO_ESTRELLA)
    dibujar_estrella(c, W - 90, 180, 12, ROSA_NEBULOSA)
    dibujar_estrella(c, 90, H - 170, 12, CYAN_HIELO)
    dibujar_estrella(c, W - 90, H - 170, 12, VERDE_ALIEN)

    numero_pagina(c, 50)
    c.showPage()

    # === PÁGINA 51: Página para colorear ===
    c.setFillColor(white)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    c.setFillColor(HexColor("#333333"))
    c.setFont(FUENTE_TITULO, 20)
    c.drawCentredString(W/2, H - 50, "¡Colorea tu propia aventura!")

    c.setFont(FUENTE_TEXTO, 12)
    c.drawCentredString(W/2, H - 75, "(¡Imprime esta página y dale color!)")

    # Dibujo de Luna para colorear (solo contornos)
    cx, cy = W/2, H/2 + 50
    s = 2.5
    c.setStrokeColor(black)
    c.setLineWidth(2)

    # Cuerpo contorno
    c.ellipse(cx - 18*s, cy - 30*s, cx + 18*s, cy + 5*s, fill=0, stroke=1)
    # Cabeza contorno
    c.circle(cx, cy + 20*s, 18*s, fill=0, stroke=1)
    # Orejas
    p = c.beginPath()
    p.moveTo(cx - 14*s, cy + 33*s)
    p.lineTo(cx - 8*s, cy + 50*s)
    p.lineTo(cx - 4*s, cy + 33*s)
    c.drawPath(p, fill=0, stroke=1)
    p2 = c.beginPath()
    p2.moveTo(cx + 4*s, cy + 33*s)
    p2.lineTo(cx + 8*s, cy + 50*s)
    p2.lineTo(cx + 14*s, cy + 33*s)
    c.drawPath(p2, fill=0, stroke=1)
    # Ojos
    c.ellipse(cx - 11*s, cy + 16*s, cx - 3*s, cy + 28*s, fill=0, stroke=1)
    c.ellipse(cx + 3*s, cy + 16*s, cx + 11*s, cy + 28*s, fill=0, stroke=1)
    # Nariz
    p3 = c.beginPath()
    p3.moveTo(cx, cy + 17*s)
    p3.lineTo(cx - 2.5*s, cy + 14*s)
    p3.lineTo(cx + 2.5*s, cy + 14*s)
    p3.close()
    c.drawPath(p3, fill=0, stroke=1)
    # Bigotes
    c.line(cx - 16*s, cy + 15*s, cx - 30*s, cy + 18*s)
    c.line(cx + 16*s, cy + 15*s, cx + 30*s, cy + 18*s)
    c.line(cx - 16*s, cy + 12*s, cx - 30*s, cy + 10*s)
    c.line(cx + 16*s, cy + 12*s, cx + 30*s, cy + 10*s)
    # Patitas
    c.ellipse(cx - 16*s, cy - 35*s, cx - 6*s, cy - 27*s, fill=0, stroke=1)
    c.ellipse(cx + 6*s, cy - 35*s, cx + 16*s, cy - 27*s, fill=0, stroke=1)

    # Estrellas para colorear
    for x, y, r in [(100, H - 150, 20), (W - 100, H - 150, 20), (100, 150, 15), (W - 100, 150, 15)]:
        c.setFillColor(white)
        dibujar_estrella(c, x, y, r, white)
        # Redibujar solo contorno
        c.setStrokeColor(black)
        pts_star = []
        for i in range(10):
            angle = math.pi / 2 + i * math.pi / 5
            rad = r if i % 2 == 0 else r * 0.4
            pts_star.append((x + rad * math.cos(angle), y + rad * math.sin(angle)))
        p = c.beginPath()
        p.moveTo(pts_star[0][0], pts_star[0][1])
        for px, py in pts_star[1:]:
            p.lineTo(px, py)
        p.close()
        c.drawPath(p, fill=0, stroke=1)

    numero_pagina(c, 51)
    c.showPage()

    # === PÁGINA 52: Contraportada ===
    fondo_espacio(c, MORADO_ESPACIO)

    # Texto de contraportada
    c.setFillColor(AMARILLO_ESTRELLA)
    c.setFont(FUENTE_TITULO, 18)
    c.drawCentredString(W/2, H - 120, "Las Aventuras de Luna")
    c.setFont(FUENTE_TITULO, 14)
    c.drawCentredString(W/2, H - 145, "La Gata Espacial")

    c.setStrokeColor(AMARILLO_ESTRELLA)
    c.setLineWidth(1)
    c.line(W/2 - 80, H - 160, W/2 + 80, H - 160)

    c.setFillColor(white)
    c.setFont(FUENTE_ITALIC, 12)
    lineas_contra = [
        "Luna es una gatita gris con ojos de esmeralda",
        "que siempre soñó con explorar el espacio.",
        "Un día, construyó su propio cohete y partió",
        "en la aventura más increíble de su vida.",
        "",
        "Visitó la Luna, Marte, Júpiter, Saturno,",
        "Neptuno, una nebulosa mágica y hasta",
        "¡otra galaxia! En el camino, hizo amigos",
        "que nunca olvidará.",
        "",
        "Una historia sobre la curiosidad,",
        "la amistad y la belleza del universo.",
    ]
    y = H - 190
    for linea in lineas_contra:
        if linea:
            c.drawCentredString(W/2, y, linea)
        y -= 18

    # Luna y Zip abajo
    dibujar_luna_gata(c, W/2 - 40, 180, escala=1.5, casco=True)
    dibujar_zip_robot(c, W/2 + 50, 170, escala=1.2)

    # ISBN falso
    c.setFillColor(HexColor("#FFFFFF60"))
    c.setFont(FUENTE_TEXTO, 8)
    c.drawCentredString(W/2, 40, "ISBN 978-0-LUNA-GATA-2026")
    c.drawCentredString(W/2, 28, "© 2026 — Creado con amor y código")

    # Código de barras falso (decorativo)
    c.setFillColor(HexColor("#FFFFFF40"))
    random.seed(5252)
    bx = W/2 - 40
    for i in range(30):
        w = random.choice([1, 2])
        h = 30
        if random.random() > 0.3:
            c.rect(bx, 55, w, h, fill=1, stroke=0)
        bx += w + 1

    numero_pagina(c, 52)
    c.showPage()

    c.save()
    print(f"  ✓ Páginas 49-52 creadas: {ruta}")

if __name__ == "__main__":
    crear("../pdfs/pag_49_52.pdf")
