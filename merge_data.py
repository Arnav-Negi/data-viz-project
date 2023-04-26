import csv

consolidated_data = []

# deaths total
with open('data/annual-number-of-deaths-by-cause.csv', 'r') as f:
    reader = csv.reader(f)
    data = list(reader)
    
    # skip header row
    data = data[1:]
    
    count = 0
    
    for line in data:
        
        if(count < 5):
            print(line)
            count+=1
            
        if(line[1] == ""):
            continue
        
        country_data = {}
        country_data["country"] = line[0]
        country_data["code"] = line[1]
        country_data["year"] = line[2]
        
        total_deaths = 0
        for i in range(3, len(line)):
            if(line[i].isnumeric()):
                total_deaths += int(line[i])
                
        country_data["total_deaths"] = total_deaths
        
        consolidated_data.append(country_data)
        
with open("data/continents-according-to-our-world-in-data.csv") as f:
    reader = csv.reader(f)
    data = list(reader)
    
    # skip header row
    data = data[1:]
    
    temp_data = []
    
    for line in data:
        cont_data = {}
        cont_data["code"] = line[1]
        cont_data["continent"] = line[3]
        
        temp_data.append(cont_data)
    
    for i in range(0, len(temp_data)):
        max = 30
        for j in range(0, len(consolidated_data)):
            if(consolidated_data[j]["code"] == "OWID_WRL"):
                consolidated_data[j]["continent"] = "World"
                continue
            
            if(consolidated_data[j]["code"] == temp_data[i]["code"]):
                if max == 0:
                    break
                consolidated_data[j]["continent"] = temp_data[i]["continent"]
                max-=1

def add_to_consolidated(temp_data, type):
    for i in range(0, len(consolidated_data)):
        if(consolidated_data[i]["code"] == temp_data["code"] and consolidated_data[i]["year"] == temp_data["year"]):
            if temp_data[type] == "":
                consolidated_data[i][type] = ''
            else:
                consolidated_data[i][type] = float(temp_data[type])
            
            return

with open('data/disease-burden-vs-health-expenditure-per-capita.csv', 'r') as f:
    reader = csv.reader(f)
    data = list(reader)
    
    # skip header row
    data = data[1:]
    
    count = 0
    
    for line in data:
        if(count < 5):
            print(line)
            count+=1
            
        temp_data = {}
        temp_data["country"] = line[0]
        temp_data["code"] = line[1]
        temp_data["year"] = line[2]
        temp_data["exp"] = line[4]
        
        add_to_consolidated(temp_data, "exp")

with open('data/death-rates-from-pneumonia-and-other-lower-respiratory-infections-vs-gdp-per-capita.csv', 'r') as f:
    reader = csv.reader(f)
    data = list(reader)
    
    # skip header row
    data = data[1:]
    
    count = 0
    
    for line in data:
        if(count < 5):
            print(line)
            count+=1
            
        temp_data = {}
        temp_data["country"] = line[0]
        temp_data["code"] = line[1]
        temp_data["year"] = line[2]
        temp_data["gdp"] = line[4]
        
        add_to_consolidated(temp_data, "gdp")

# print first 5 entries
for i in range(0, 5):
    print(consolidated_data[i])
    
# write to csv
with open('data/deaths_health_gdp.csv', 'w') as f:
    writer = csv.writer(f)
    writer.writerow(["country", "code", "year", "total_deaths", "exp", "gdp", "continent"])
    
    for line in consolidated_data:
        print(line)
        writer.writerow([line["country"], line["code"], line["year"], line["total_deaths"], line["exp"], line["gdp"], line["continent"]])