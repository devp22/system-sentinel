# backend/app.py
from flask import Flask, jsonify
from flask_restful import Api
from flask_cors import CORS
import subprocess
import datetime

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"]) 
data = []
@app.route('/api/cpu', methods=['GET'])
def get_cpu_usage():
    utilization_command = "Get-WmiObject Win32_Processor | Select-Object -ExpandProperty LoadPercentage"
    utilization_result = subprocess.run(["powershell", "-Command", utilization_command], capture_output=True, text=True)
    
    if utilization_result.returncode == 0:
        utilization = utilization_result.stdout.strip()  
    else:
        utilization = "Error: Unable to retrieve utilization"
    
    speed_command = "Get-WmiObject Win32_Processor | Select-Object -ExpandProperty MaxClockSpeed"
    speed_result = subprocess.run(["powershell", "-Command", speed_command], capture_output=True, text=True)
    

    if speed_result.returncode == 0:
        try:
            speed = float(speed_result.stdout.strip()) / 1000  
        except ValueError:
            speed = "Error: Unable to parse CPU speed"
    else:
        speed = "Error: Unable to retrieve CPU speed"

    cpu_data = {"usage": utilization, "speed": f"{speed}" if isinstance(speed, float) else speed, "date": datetime.datetime.now()}
    
    data.append(cpu_data)
    print("----------------------")
    print(jsonify(data))
    return jsonify(data)

@app.route('/api/memory', methods=['GET'])
def get_memory_usage():
    memory_command = """
    $os = Get-WmiObject Win32_OperatingSystem;
    $totalMemoryMB = [math]::Round($os.TotalVisibleMemorySize / 1024, 2);
    $totalMemoryGB = [math]::Round($totalMemoryMB / 1024, 2);
    $freeMemoryMB = [math]::Round($os.FreePhysicalMemory / 1024, 2);
    $freeMemoryGB = [math]::Round($freeMemoryMB / 1024, 2);
    $usedMemoryMB = [math]::Round($totalMemoryMB - $freeMemoryMB, 2);
    $usedMemoryGB = [math]::Round($totalMemoryGB - $freeMemoryGB, 2);
    @{
        TotalMemoryGB = $totalMemoryGB;
        FreeMemoryGB = $freeMemoryGB;
        UsedMemoryGB = $usedMemoryGB;
    } | ConvertTo-Json -Compress
    """
    memory_result = subprocess.run(
        ["powershell", "-Command", memory_command],
        capture_output=True,
        text=True
    )

    # Check for errors and return the clean output
    if memory_result.returncode == 0:
        try:
            # Parse JSON and ensure it's returned as a clean dict
            memory_data = memory_result.stdout.strip()  
            memory_json = eval(memory_data)  # Parse output into a Python dictionary
        except Exception as e:
            memory_json = {"error": f"Error parsing memory data: {str(e)}"}
    else:
        memory_json = {"error": "Unable to retrieve memory usage"}

    # Return the data as JSON
    return jsonify(memory_json)

if __name__ == '__main__':
    app.run(debug=True)
