from PIL import Image
import os

def extract_and_remove_bg(in_path, out_path, box, bg_coord=(0,0), tolerance=30):
    try:
        img = Image.open(in_path).convert("RGBA")
        
        # Crop the box
        cropped = img.crop(box)
        
        # Get background color from the specified coordinate within the cropped image
        # or from the original image if we want to be safe. Let's use the top-left of the original image
        bg_color = img.getpixel(bg_coord)
        
        data = cropped.getdata()
        new_data = []
        for item in data:
            if (abs(item[0] - bg_color[0]) <= tolerance and
                abs(item[1] - bg_color[1]) <= tolerance and
                abs(item[2] - bg_color[2]) <= tolerance):
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)
                
        cropped.putdata(new_data)
        cropped.save(out_path, "PNG")
        print(f"Successfully processed {in_path} -> {out_path}")
    except Exception as e:
        print(f"Error processing {in_path}: {e}")

# char1 (red hood) - top left sprite
extract_and_remove_bg("assets/char1_new_raw.jpg", "assets/char1.png", box=(0, 0, 92, 92), bg_coord=(0,0))

# char2 (Gehnri) - first sprite is below the text
# Text is at the top, let's crop x: 0-100, y: 120-250
extract_and_remove_bg("assets/char2_new_raw.jpg", "assets/char2.png", box=(0, 120, 100, 250), bg_coord=(0,0))
