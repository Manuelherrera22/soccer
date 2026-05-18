import fitz  # PyMuPDF
import sys

ai_path = r"c:\Users\Corvus\Desktop\Soccer\soccer-app\public\KV_LOGO ELITE GAMING_DAVIVIENDA -TIGO_Carpeta\KV_LOGO ELITE GAMING_DAVIVIENDA -TIGO.ai"
try:
    doc = fitz.open(ai_path)
    page = doc.load_page(0)
    
    # Render with a transparent background
    pix = page.get_pixmap(alpha=True, dpi=300)
    pix.save(r"c:\Users\Corvus\Desktop\Soccer\soccer-app\public\logo.png")
    print("Successfully rendered logo.png with transparent background.")
except Exception as e:
    print(f"Error: {e}")
