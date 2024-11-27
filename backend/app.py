from flask import Flask, jsonify
from flask_restful import Api
from flask_cors import CORS
import subprocess
import datetime

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

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

    cpu_data = {
        "usage": utilization,
        "speed": f"{speed}" if isinstance(speed, float) else speed,
    }
    
    return jsonify(cpu_data)  # Return only the latest CPU data

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

    if memory_result.returncode == 0:
        try:
            memory_data = memory_result.stdout.strip()  
            memory_json = eval(memory_data)  # Parse output into a Python dictionary
        except Exception as e:
            memory_json = {"error": f"Error parsing memory data: {str(e)}"}
    else:
        memory_json = {"error": "Unable to retrieve memory usage"}

    return jsonify(memory_json)  # Return the latest memory data

@app.route('/api/disk', methods=['GET'])
def get_disk_usage():
    disk_command = """Get-WmiObject Win32_PerfFormattedData_PerfDisk_LogicalDisk | Where-Object { $_.Name -eq "C:" } | Select-Object -ExpandProperty PercentDiskTime"""
    disk_result = subprocess.run(["powershell", "-Command", disk_command], capture_output=True, text=True)
    
    if disk_result.returncode == 0:
        disk = disk_result.stdout.strip()  
    else:
        disk = "Error: Unable to retrieve disk"

    disk_data = {"percentage_disk_time": disk}
    
    return jsonify(disk_data)  # Return only the latest disk data

@app.route('/api/wifi', methods=['GET'])
def get_wifi_usage():
    wifi_command = """
    $initialStats = Get-NetAdapterStatistics -Name "Wi-Fi"
    $initialReceived = $initialStats.ReceivedBytes
    $initialSent = $initialStats.SentBytes
    Start-Sleep -Seconds 1
    $currentStats = Get-NetAdapterStatistics -Name "Wi-Fi"
    $currentReceived = $currentStats.ReceivedBytes
    $currentSent = $currentStats.SentBytes
    $receivedBytesDelta = $currentReceived - $initialReceived
    $sentBytesDelta = $currentSent - $initialSent
    $totalBytesDelta = $receivedBytesDelta + $sentBytesDelta
    $throughputMbps = [math]::Round(($totalBytesDelta * 8) / 1MB, 2)
    @{
        SendBytes = $sentBytesDelta
        ReceivedBytes = $receivedBytesDelta
        ThroughputMbps = $throughputMbps
    } | ConvertTo-Json -Compress
    """
    
    wifi_result = subprocess.run(
        ["powershell", "-Command", wifi_command],
        capture_output=True,
        text=True
    )

    if wifi_result.returncode == 0:
        wifi_data = wifi_result.stdout.strip()
        return jsonify(eval(wifi_data))  # Return the latest Wi-Fi data as JSON
    else:
        return jsonify({"error": "Unable to retrieve Wi-Fi statistics"})

if __name__ == '__main__':
    app.run(debug=True)
