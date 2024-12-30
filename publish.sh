#!/bin/bash
set -x
# Navigate to the plugins directory
cd plugins

# Loop through each folder in the plugins directory
for folder in */ ; do
  # Remove the trailing slash from the folder name
  folder=${folder%/}
  
  echo "Processing $folder..."
  
  # Run the specified commands
  yarn --cwd "$folder" build
  yarn --cwd "$folder" npm publish
done

echo "All plugins processed."
