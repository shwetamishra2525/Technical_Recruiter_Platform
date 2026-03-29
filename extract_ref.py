import zipfile
import xml.etree.ElementTree as ET
import os

zip_path = r"E:\MSC-II-2\Sem 4 Writeups-20250528T050859Z-1-001.zip"
target_file = "Sem 4 Writeups/Project/ARTIV MAIN DOC(1).docx"

try:
    with zipfile.ZipFile(zip_path, 'r') as zf:
        with zf.open(target_file) as docx_file:
            with zipfile.ZipFile(docx_file) as docx:
                if 'word/document.xml' in docx.namelist():
                    tree = ET.fromstring(docx.read('word/document.xml'))
                    namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
                    texts = [node.text for node in tree.findall('.//w:t', namespaces) if node.text]
                    with open("reference_text.txt", "w", encoding="utf-8") as f:
                        f.write('\n'.join(texts))
                    print("Extraction successful.")
                else:
                    print("word/document.xml not found in the docx.")
except Exception as e:
    print(f"Error: {e}")
