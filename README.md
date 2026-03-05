# Basic Web Image Studio

Basic Web Image Studio is a browser-based image editing workspace built with plain HTML, CSS, and JavaScript.  
It supports drag-and-drop uploads, transform controls (move, scale, rotate, flip), filter actions, undo/redo history, and RGBA/brightness channel adjustments.

## Features

- Drag-and-drop or click-to-upload image import
- Transform tools: move, scale, rotate, flip, and recenter
- Filter tools: invert, grayscale, dark edges, beige, polarization, acrylic, median, sobel
- Map generation tools: height map and normal map
- Channel controls: red, green, blue, alpha, and brightness
- Multi-step undo/redo history with progress indicators
- Download/export of edited output

## Workspace Overview

This repository is intentionally lightweight and does not require a build step.

```
basic-web-image-studio/
├── index.html              # Main app shell and editor layout
├── src/
│   └── main.js             # Client-side editor logic and image processing
├── public/
│   ├── styles.css          # App styling and layout
│   ├── favicon.ico
│   ├── favicon-256.png
│   └── img/
│       └── background.png
└── README.md
```

## Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/TheDoctorTTV/basic-web-image-studio.git
   cd basic-web-image-studio
   ```
2. Open `index.html` in your browser.
3. Drag and drop an image (or click the drop area) to start editing.

## Supported Files and Limits

- Accepted image types: `PNG`, `JPG/JPEG`, `WEBP`, `GIF`, `BMP`
- Maximum upload size: `20 MB`
- Maximum decoded image dimensions: `40 megapixels`

These limits help keep the editor responsive and prevent browser memory issues.

## Development Notes

- No framework or bundler is required.
- The app runs fully client-side in the browser.
- Main behavior lives in `src/main.js`; layout and UI are in `index.html` and `public/styles.css`.

## Browser Support

This project targets modern browsers with current JavaScript and Canvas support, including:

- Chrome (latest)
- Edge (latest)
- Firefox (latest)
- Safari (latest)

## Open Source

This is an open source project. Contributions, issues, and improvements are welcome.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make your changes and test in browser.
4. Commit with a clear message.
5. Open a pull request describing what changed and why.


## License

This project is licensed under the MIT License.
