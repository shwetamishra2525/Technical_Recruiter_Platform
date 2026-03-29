import openpyxl
from openpyxl.chart import PieChart3D, Reference

# Create a new workbook
wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Pie Chart Data"

# Format the data exactly as the screenshot reference requires
# Format: [Label with Days/Dates, Duration Value]
data = [
    ["Phase", "Duration"],
    ["Technical Recruiter Platform Implementation 5.5 Months 01-Oct-25 20-Mar-26", 171],
    ["Requirement Gathering 20 Days 01-Aug-25 20-Aug-25", 20],
    ["Planning 21 Days 21-Aug-25 10-Sep-25", 21],
    ["Analysis and Design 20 Days 11-Sep-25 30-Sep-25", 20],
]

for row in data:
    ws.append(row)

# Create the 3D Pie Chart object
pie = PieChart3D()
pie.title = "TRP Phase 1"

# Grab the labels (Column A) and values (Column B)
labels = Reference(ws, min_col=1, min_row=2, max_row=5)
data_ref = Reference(ws, min_col=2, min_row=1, max_row=5)

pie.add_data(data_ref, titles_from_data=True)
pie.set_categories(labels)

# Position the legend at the bottom to match the screenshot upload
pie.legend.position = 'b' 

# Set chart size to be wide enough to show the long labels neatly
pie.width = 18 
pie.height = 10 

# Add the chart to the Excel sheet
ws.add_chart(pie, "D2")

# Save the generated excel file
file_path = r"e:\MSC-II\Technical_Recruiter Project\Planning_Pie_Chart.xlsx"
wb.save(file_path)
print("Saved 3D Pie Chart successfully!")
