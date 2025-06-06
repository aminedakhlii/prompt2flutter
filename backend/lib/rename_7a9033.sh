find ./modern_dashboard -type f | while read -r file; do
  # Strip leading './' and convert slashes to underscores
  newname=$(echo "$file" | sed 's|^\./||' | tr '/' '_')
  
  # Get current directory of the file
  dir=$(dirname "$file")
  
  # Full new path
  newpath="$dir/$newname"

  # If file already exists, append short hash to avoid conflict
  if [ -e "$newpath" ]; then
    hash=$(echo "$file" | md5sum | cut -c1-6)
    newpath="$dir/${newname%.*}_$hash.${newname##*.}"
  fi

  mv "$file" "$newpath"
done
