import markdown
import os

md_file1 = r"C:\Users\shubh_pxcosk1\.gemini\antigravity\brain\1b639adb-c063-48bc-8059-d3a1542b4df7\report_phase1_ch1_to_3.md"
md_file2 = r"C:\Users\shubh_pxcosk1\.gemini\antigravity\brain\1b639adb-c063-48bc-8059-d3a1542b4df7\report_phase2_ch4_to_7.md"

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

md_content = read_file(md_file1) + "\n\n" + read_file(md_file2)

# Specific adjustments for Mermaid parsing or stripping since HTML doc won't render mermaid
md_content = md_content.replace('```mermaid', '```')

html_content = markdown.markdown(md_content, extensions=['tables', 'fenced_code'])

doc_template = f"""<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>Technical Recruiter Project Report</title>
<style>
    body {{ font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; }}
    h1 {{ font-size: 18pt; text-align: center; }}
    h2 {{ font-size: 16pt; }}
    h3 {{ font-size: 14pt; }}
    table {{ border-collapse: collapse; width: 100%; }}
    th, td {{ border: 1px solid black; padding: 8px; }}
</style>
</head>
<body>
{html_content}
</body>
</html>
"""

output_path = r"e:\MSC-II\Technical_Recruiter Project\Technical_Recruiter_Blackbook.doc"

with open(output_path, 'w', encoding='utf-8') as f:
    f.write(doc_template)

print(f"Successfully created {output_path}")
