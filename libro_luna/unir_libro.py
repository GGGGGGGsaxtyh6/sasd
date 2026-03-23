"""Une todos los PDFs parciales en un solo libro completo."""
import os
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

try:
    from PyPDF2 import PdfMerger
    HAS_PYPDF2 = True
except ImportError:
    HAS_PYPDF2 = False

def unir_con_pypdf2():
    merger = PdfMerger()
    pdfs_dir = os.path.join(os.path.dirname(__file__), "pdfs")
    archivos = sorted([f for f in os.listdir(pdfs_dir) if f.endswith(".pdf")])

    for archivo in archivos:
        ruta = os.path.join(pdfs_dir, archivo)
        merger.append(ruta)
        print(f"  + {archivo}")

    salida = os.path.join(os.path.dirname(__file__), "Luna_La_Gata_Espacial.pdf")
    merger.write(salida)
    merger.close()
    return salida

def unir_manual():
    """Unión manual leyendo cada PDF y copiando página por página usando reportlab."""
    import subprocess
    pdfs_dir = os.path.join(os.path.dirname(__file__), "pdfs")
    archivos = sorted([f for f in os.listdir(pdfs_dir) if f.endswith(".pdf")])

    rutas = [os.path.join(pdfs_dir, f) for f in archivos]
    salida = os.path.join(os.path.dirname(__file__), "Luna_La_Gata_Espacial.pdf")

    # Usar gs (ghostscript) si está disponible
    try:
        cmd = ["gs", "-dBATCH", "-dNOPAUSE", "-q", "-sDEVICE=pdfwrite",
               f"-sOutputFile={salida}"] + rutas
        subprocess.run(cmd, check=True)
        return salida
    except (FileNotFoundError, subprocess.CalledProcessError):
        pass

    # Usar pdfunite si está disponible
    try:
        cmd = ["pdfunite"] + rutas + [salida]
        subprocess.run(cmd, check=True)
        return salida
    except (FileNotFoundError, subprocess.CalledProcessError):
        pass

    raise RuntimeError("No se encontró herramienta para unir PDFs")

if __name__ == "__main__":
    print("Uniendo libro completo...")
    if HAS_PYPDF2:
        ruta = unir_con_pypdf2()
    else:
        ruta = unir_manual()

    size_mb = os.path.getsize(ruta) / (1024 * 1024)
    print(f"\n✓ Libro completo: {ruta}")
    print(f"  Tamaño: {size_mb:.2f} MB")
