Neha’s photographs are stored directly in public/:

- /IMG_4028.jpg — first album memory and finale keepsake
- /IMG_4026%202.PNG — second album memory; the space in the filename is URL encoded
- /IMG_4036.jpg — third album memory
- /IMG_4037.jpg — fourth album memory and hidden-surprise photo

photos.json is a reference list of their exact URLs, captions, descriptions, dimensions, and keepsake IDs. The application’s photo list is configured in src/data/defaultConfig.ts; src/data/experienceConfig.ts selects the hidden-surprise photo and finale keepsake. Public files are served from the site root: use /IMG_4028.jpg, not /public/IMG_4028.jpg. The experience also respects Vite’s base URL when hosted in a subdirectory.

All four images are connected to the album. They use object-fit: contain and portrait frames so their existing layouts are preserved, including in the enlarged photo view, hidden surprise, and finale. The originals have been left unchanged.
