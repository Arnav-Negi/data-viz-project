import csv

consolidated_data = []

# deaths total
with open('data/crude-death-rate.csv', 'r') as f:
    reader = csv.reader(f)
    data = list(reader)
    
    # skip header row
    headers = data[4:][0]
    print(headers)
    data = data[5:]
    
    count = 0
    
    for line in data:
        
        if(count < 5):
            count+=1
            
            for i in range(44, len(line)-3):
                print(headers[i], line[i])
            
        if(line[1] == ""):
            continue
        
    #     if(int(line[2]) < 2000):
    #         continue
        for i in range(44, len(line)-3):
            country_data = {}
            country_data["country"] = line[0]
            country_data["code"] = line[1]
        
            country_data["year"] = headers[i]
            country_data["death_rate"] = line[i]
            
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
        max = 20
        for j in range(0, len(consolidated_data)):
            
            if(consolidated_data[j]["code"] == "OWID_WRL"):
                consolidated_data[j]["continent"] = "World"
                continue
            
            if(consolidated_data[j]["code"] == temp_data[i]["code"]):
                if max == 0:
                    break
                consolidated_data[j]["continent"] = temp_data[i]["continent"]
                max-=1
    # remove countries with no continent key
    consolidated_data = [x for x in consolidated_data if "continent" in x]

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
        
    # # remove countries with exp = ''
    # consolidated_data = [x for x in consolidated_data if x["exp"] != '']

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
    writer.writerow(["country", "code", "year", "death_rate", "exp", "gdp", "continent"])
    
    for line in consolidated_data:
        print(line)
        writer.writerow([line["country"], line["code"], line["year"], line["death_rate"], line["exp"], line["gdp"], line["continent"]])