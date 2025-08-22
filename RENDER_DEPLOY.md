## 1. Make the script executable

Run this command in your repository root:

```bash
chmod +x render-build.sh
```

## 2. Recommended Render build command

Set your Render **Build Command** to:

```bash
./render-build.sh && poetry install
```

This will ensure Tesseract OCR is installed before your Python dependencies.

## 3. Optional Python snippet for pytesseract

If pytesseract does not automatically locate the Tesseract binary, set the path manually in your code:

```python
import pytesseract

pytesseract.pytesseract.tesseract_cmd = "/usr/bin/tesseract"
```

Place this before any pytesseract usage to ensure correct detection.