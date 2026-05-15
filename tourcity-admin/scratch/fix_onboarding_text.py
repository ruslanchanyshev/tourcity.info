import sys
import re

file_path = '/Users/rch/tourcity.info/TourCity/Services/LocalizationManager.swift'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Keys to update
keys = [
    "onboarding_subtitle",
    "onboarding_offline_desc",
    "onboarding_curated_desc",
    "onboarding_discounts_desc",
    "onboarding_guide_desc"
]

def add_newline(match):
    key_part = match.group(1)
    translations_part = match.group(2)
    # Replace the first dot followed by space with \n
    # Handle different types of dots (standard, chinese, etc)
    updated_translations = re.sub(r'([\.\!\?。])\s+', r'\1\\n', translations_part)
    return f'"{key_part}": [\n{updated_translations}'

for key in keys:
    pattern = rf'"{key}": \[\n(.*?)(?=\s+\])'
    content = re.sub(pattern, add_newline, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully updated line breaks in onboarding translations.")
