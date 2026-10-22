import os
import re

def get_all_files(directory, extensions):
    matches = []
    for root, dirnames, filenames in os.walk(directory):
        for filename in filenames:
            if filename.lower().endswith(extensions):
                matches.append(os.path.join(root, filename))
    return matches

def to_snake_case(filename):
    # Remove extension
    name, ext = os.path.splitext(filename)
    # Replace spaces and hyphens with underscores
    name = name.replace(' ', '_').replace('-', '_')
    # Remove any other non-alphanumeric characters (except underscores)
    name = re.sub(r'[^a-zA-Z0-9_]', '', name)
    # Convert to lowercase
    name = name.lower()
    # Handle multiple underscores
    name = re.sub(r'_+', '_', name)
    # Strip leading/trailing underscores
    name = name.strip('_')
    return name + ext

def main():
    assets_dir = 'public/assets'
    image_extensions = ('.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif')
    
    files = get_all_files(assets_dir, image_extensions)
    
    renames = []
    
    for file_path in files:
        directory = os.path.dirname(file_path)
        filename = os.path.basename(file_path)
        
        new_filename = to_snake_case(filename)
        
        if filename != new_filename:
            new_path = os.path.join(directory, new_filename)
            renames.append((file_path, new_path))
            
    # Also check for directory renaming (e.g. Finance -> finance)
    # But let's stick to files first as requested "rename all the images". 
    # Actually, "Finance" folder should probably be lowercased too if we want full snake case compliance for paths.
    # Let's handle file renames first.
    
    print(f"Found {len(renames)} files to rename.")
    for old, new in renames:
        print(f"{old} -> {new}")

if __name__ == "__main__":
    main()
