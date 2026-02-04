#!/bin/bash

# Based on original script from: https://gist.github.com/dcryan/0dd2b5197c25b3ad64c44b67e131d12f

# Check if the input image is provided
if [ -z "$1" ]; then
  echo "Usage: $0 path/to/image.png"
  exit 1
fi

# Set input image path from argument
INPUT_IMAGE="$1"

# Set output directory for favicons (optional: can be set to another directory)
OUTPUT_DIR="."

# Use Lanczos for smaller sizes to preserve details
ffmpeg -i "$INPUT_IMAGE" -vf "scale=16:16:force_original_aspect_ratio=decrease" -sws_flags lanczos "$OUTPUT_DIR/icon-16.png"
ffmpeg -i "$INPUT_IMAGE" -vf "scale=32:32:force_original_aspect_ratio=decrease" -sws_flags lanczos "$OUTPUT_DIR/icon-32.png"
ffmpeg -i "$INPUT_IMAGE" -vf "scale=48:48:force_original_aspect_ratio=decrease" -sws_flags lanczos "$OUTPUT_DIR/icon-48.png"

# Use default scaling for larger sizes (bicubic by default)
ffmpeg -i "$INPUT_IMAGE" -vf "scale=64:64:force_original_aspect_ratio=decrease" "$OUTPUT_DIR/icon-64.png"
ffmpeg -i "$INPUT_IMAGE" -vf "scale=96:96:force_original_aspect_ratio=decrease" "$OUTPUT_DIR/icon-96.png"
ffmpeg -i "$INPUT_IMAGE" -vf "scale=180:180:force_original_aspect_ratio=decrease" "$OUTPUT_DIR/icon-180.png"
ffmpeg -i "$INPUT_IMAGE" -vf "scale=192:192:force_original_aspect_ratio=decrease" "$OUTPUT_DIR/icon-192.png"
# ffmpeg -i "$INPUT_IMAGE" -vf "scale=512:512:force_original_aspect_ratio=decrease" "$OUTPUT_DIR/icon-512.png"

# Generate .ico file combining multiple sizes
ffmpeg -i "$OUTPUT_DIR/icon-16.png" -i "$OUTPUT_DIR/icon-32.png" -i "$OUTPUT_DIR/icon-48.png" -i "$OUTPUT_DIR/icon-64.png" "$OUTPUT_DIR/icon.ico"

# Output HTML snippet
echo "Favicons generated and saved to $OUTPUT_DIR."
echo ""
echo "Add the following HTML to your <head> section:"
echo ""
echo "<link rel=\"icon\" type=\"image/x-icon\" href=\"$OUTPUT_DIR/icon.ico\">"
echo "<link rel=\"icon\" type=\"image/png\" sizes=\"16x16\" href=\"$OUTPUT_DIR/icon-16.png\">"
echo "<link rel=\"icon\" type=\"image/png\" sizes=\"32x32\" href=\"$OUTPUT_DIR/icon-32.png\">"
echo "<link rel=\"icon\" type=\"image/png\" sizes=\"48x48\" href=\"$OUTPUT_DIR/icon-48.png\">"
echo "<link rel=\"icon\" type=\"image/png\" sizes=\"64x64\" href=\"$OUTPUT_DIR/icon-64.png\">"
echo "<link rel=\"icon\" type=\"image/png\" sizes=\"96x96\" href=\"$OUTPUT_DIR/icon-96.png\">"
echo "<link rel=\"icon\" type=\"image/png\" sizes=\"180x180\" href=\"$OUTPUT_DIR/icon-180.png\">"
echo "<link rel=\"icon\" type=\"image/png\" sizes=\"192x192\" href=\"$OUTPUT_DIR/icon-192.png\">"
echo "<link rel=\"icon\" type=\"image/png\" sizes=\"512x512\" href=\"$OUTPUT_DIR/icon-512.png\">"
echo ""
echo "<!-- For Apple Touch Icon -->"
echo "<link rel=\"apple-touch-icon\" sizes=\"180x180\" href=\"$OUTPUT_DIR/icon-180.png\">"
echo ""
echo "<!-- For Android Chrome -->"
echo "<link rel=\"icon\" type=\"image/png\" sizes=\"192x192\" href=\"$OUTPUT_DIR/icon-192.png\">"
echo ""
echo "<!-- Web App Manifest Icon (PWA) -->"
echo "<link rel=\"icon\" type=\"image/png\" sizes=\"512x512\" href=\"$OUTPUT_DIR/icon-512.png\">"
