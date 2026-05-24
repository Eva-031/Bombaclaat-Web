from PIL import Image, ImageDraw

def remove_bg():
    img = Image.open("assets/pixel_bomb.png").convert("RGBA")
    
    # Flood fill from the 4 corners to replace the white background with transparency
    # thresh=30 handles slight variations in the white background
    ImageDraw.floodfill(img, xy=(0, 0), value=(0, 0, 0, 0), thresh=30)
    ImageDraw.floodfill(img, xy=(img.width-1, 0), value=(0, 0, 0, 0), thresh=30)
    ImageDraw.floodfill(img, xy=(0, img.height-1), value=(0, 0, 0, 0), thresh=30)
    ImageDraw.floodfill(img, xy=(img.width-1, img.height-1), value=(0, 0, 0, 0), thresh=30)
    
    img.save("assets/pixel_bomb_transparent.png")
    print("Background removed successfully.")

if __name__ == "__main__":
    remove_bg()
