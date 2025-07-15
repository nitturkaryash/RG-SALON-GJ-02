import pandas as pd
import json

# Read the Excel file
df = pd.read_excel('SHEETS/PRODUCT APRIL-2025.xlsx')

# Convert DataFrame to list of dictionaries
records = df.to_dict('records')

# Print as JSON for easy copying
print(json.dumps(records, indent=2)) 