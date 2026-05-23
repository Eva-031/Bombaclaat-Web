from PIL import Image

def remove_background(image_path, output_path, tolerance=10):
    img = Image.open(image_path).convert("RGBA")
    data = img.getdata()
    
    # Get the background color from the top-left pixel (0, 0)
    bg_color = data[0]
    
    new_data = []
    for item in data:
        # Check if the pixel is within the tolerance range of the background color
        if (abs(item[0] - bg_color[0]) <= tolerance and
            abs(item[1] - bg_color[1]) <= tolerance and
            abs(item[2] - bg_color[2]) <= tolerance):
            new_data.append((255, 255, 255, 0)) # Make transparent
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Removed background from {image_path} and saved to {output_path}")

remove_background("assets/stone_wall.png", "assets/stone_wall.png", tolerance=20)
# Let's also do wood_crate just in case
remove_background("assets/wood_crate.png", "assets/wood_crate.png", tolerance=20)
