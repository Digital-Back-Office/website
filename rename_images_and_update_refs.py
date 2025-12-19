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
    name, ext = os.path.splitext(filename)
    name = name.replace(' ', '_').replace('-', '_')
    name = re.sub(r'[^a-zA-Z0-9_]', '', name)
    name = name.lower()
    name = re.sub(r'_+', '_', name)
    name = name.strip('_')
    return name + ext

def update_references(root_dir, old_name, new_name):
    # We search for the filename. 
    # If the old filename has spaces, it might be URL encoded in some places (%20).
    # But usually in code it's the literal string.
    # In Markdown/HTML, it might be literal.
    
    text_extensions = ('.astro', '.md', '.mdx', '.js', '.ts', '.json', '.css', '.html', '.mjs')
    
    # We also need to handle URL encoded versions for spaces
    old_name_encoded = old_name.replace(' ', '%20')
    
    count = 0
    for root, dirnames, filenames in os.walk(root_dir):
        # Skip node_modules and .git
        if 'node_modules' in dirnames:
            dirnames.remove('node_modules')
        if '.git' in dirnames:
            dirnames.remove('.git')
            
        for filename in filenames:
            if filename.endswith(text_extensions):
                file_path = os.path.join(root, filename)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    new_content = content
                    if old_name in new_content:
                        new_content = new_content.replace(old_name, new_name)
                    
                    if old_name_encoded != old_name and old_name_encoded in new_content:
                        new_content = new_content.replace(old_name_encoded, new_name)
                        
                    if new_content != content:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Updated references in {file_path}")
                        count += 1
                except Exception as e:
                    print(f"Error reading/writing {file_path}: {e}")
    return count

def main():
    assets_dir = 'public/assets'
    src_dir = 'src' # Also check public for css/js references
    public_dir = 'public'
    
    image_extensions = ('.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif')
    
    files = get_all_files(assets_dir, image_extensions)
    
    renames = []
    
    for file_path in files:
        directory = os.path.dirname(file_path)
        filename = os.path.basename(file_path)
        
        new_filename = to_snake_case(filename)
        
        if filename != new_filename:
            new_path = os.path.join(directory, new_filename)
            renames.append((file_path, new_path, filename, new_filename))
            
    print(f"Found {len(renames)} files to rename.")
    
    for old_path, new_path, old_filename, new_filename in renames:
        print(f"Renaming {old_filename} -> {new_filename}")
        
        # 1. Rename file
        try:
            os.rename(old_path, new_path)
        except OSError as e:
            print(f"Error renaming {old_path}: {e}")
            continue
            
        # 2. Update references in src
        update_references(src_dir, old_filename, new_filename)
        # 3. Update references in public (css/js)
        update_references(public_dir, old_filename, new_filename)

if __name__ == "__main__":
    main()
