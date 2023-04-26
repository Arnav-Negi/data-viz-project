import csv

consolidated_data = []

def check_if_country_exists(country):
    for item in consolidated_data:
        if item["country"] == country:
            return True
    return False

death_nums = []
death_causes = []
data = {}
# deaths total
with open("data/annual-number-of-deaths-by-cause.csv", "r") as f:
    reader = csv.reader(f)
    headers = reader.__next__()
    # add death causes to dict
    for i in range(4, len(headers)):
        death_nums.append(0)
        if(len(headers[i].split(" ")) > 1):
            death_causes.append(headers[i].split(" ")[2])
        else:
            death_causes.append(headers[i].split(" ")[0])
    
    for line in reader:
        for i in range(4, len(line)):
            if line[i].isdigit():
                death_nums[i-4] = death_nums[i-4] + int(line[i])

    print(death_causes)
    # create dict of death causes and totals
    for i in range(len(death_causes)):
        data[death_causes[i]] = death_nums[i]
        
with open("data/total_deaths_by_cause.csv", "w") as f:
    writer = csv.writer(f)
    writer.writerow(["cause", "total"])
    for key, value in data.items():
        writer.writerow([key, value])