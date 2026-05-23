import sys
import os
from PIL import Image

# Configuration for the 6 sprites
# We specify (columns, rows) for each raw image so we can crop the top-left sprite.
# We'll just map them by index 1 to 6.
# You need to adjust the cols/rows if they don't match.
sprite_configs = {
    'char1_raw.png': (1, 1), # Assume 1x1 if unknown, we'll check aspect ratio
    'char2_raw.png': (1, 1),
    'char3_raw.jpg': (3, 4), # Snorlax
    'char4_raw.jpg': (4, 4), # Dawn
    'char5_raw.jpg': (2, 4), # Mimikyu
    'char6_raw.jpg': (2, 4), # Grookey
}

def process_image(filename, cols, rows, tolerance=30):
    in_path = os.path.join("assets", filename)
    out_name = filename.replace("_raw.jpg", ".png").replace("_raw.png", ".png")
    out_path = os.path.join("assets", out_name)
    
    if not os.path.exists(in_path):
        print(f"File {in_path} does not exist.")
        return

    try:
        img = Image.open(in_path).convert("RGBA")
        
        # If it's 1x1 config, let's guess based on aspect ratio or just use 4 rows
        # Actually let's assume the user's first 2 images might also be sprite sheets.
        # Let's just crop to the first col/row
        w, h = img.size
        sprite_w = w // cols
        sprite_h = h // rows
        
        # Crop top-left sprite
        # For Snorlax, the front facing is usually row 1, col 2.
        # Let's just grab the top-left one (0, 0)
        box = (0, 0, sprite_w, sprite_h)
        cropped = img.crop(box)
        
        # Remove background (assume top-left pixel is bg)
        data = cropped.getdata()
        bg_color = data[0]
        
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
        print(f"Processed {filename} -> {out_name} (cropped to {sprite_w}x{sprite_h})")
    except Exception as e:
        print(f"Error processing {filename}: {e}")

# Process all 6
for filename, (cols, rows) in sprite_configs.items():
    process_image(filename, cols, rows)
