import sys, glob
from PIL import Image
d = sys.argv[1]
fs = sorted(glob.glob(f'{d}/f*.png'))
ims = [Image.open(f) for f in fs]
w, h = ims[0].size; g = 6
sheet = Image.new('RGB', (4 * w + 3 * g, 2 * h + g), 'white')
for i, im in enumerate(ims[:8]):
    sheet.paste(im, ((i % 4) * (w + g), (i // 4) * (h + g)))
sheet.save(f'{d}/sheet.png')
