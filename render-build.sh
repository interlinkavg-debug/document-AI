#!/usr/bin/env bash

set -e

echo "Updating apt package list..."
sudo apt-get update

echo "Installing Tesseract OCR..."
sudo apt-get install -y tesseract-ocr

echo "Tesseract OCR installation complete."