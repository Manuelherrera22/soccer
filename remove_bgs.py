from rembg import remove
from PIL import Image
import os

images = ["logo.png", "davivienda.png", "tigo.png"]
public_dir = r"c:\Users\Corvus\Desktop\Soccer\soccer-app\public"

for img_name in images:
    input_path = os.path.join(public_dir, img_name)
    try:
        input_image = Image.open(input_path)
        output_image = remove(input_image)
        output_image.save(input_path)
        print(f"Successfully removed background from {img_name}")
    except Exception as e:
        print(f"Failed processing {img_name}: {e}")
