from flask import Flask, jsonify
from flask_restful import Api
from flask_cors import CORS
import subprocess
import platform
import json

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

@app.route('/api/shell', methods=['GET'])
def get_shell_type():
    osType = platform.platform()
    if("macOS" in osType) :
        return "bash"
    elif("Windows" in osType):
        return "Powershell"
    


@app.route('/api/cpu', methods=['GET'])
def get_cpu_usage():
    shellType = get_shell_type()
    if shellType == "bash":
        utilization_command = "top -l 1 | grep 'CPU usage' | awk '{print $3 + $5 }' "
        utilization_result = subprocess.run(utilization_command, shell=True, capture_output=True, text=True)

    else:
        utilization_command = "Get-WmiObject Win32_Processor | Select-Object -ExpandProperty LoadPercentage"
        utilization_result = subprocess.run(["powershell", "-Command", utilization_command], capture_output=True, text=True)
    
    if utilization_result.returncode == 0:
        utilization = utilization_result.stdout.strip()  
    else:
        utilization = "Error: Unable to retrieve utilization"
    
    if shellType == "bash":
        speed_command = "sysctl -n hw.cpufrequency | awk '{print $1 / 1e6 }'"
        speed_result = utilization_result = subprocess.run(speed_command, shell=True, capture_output=True, text=True)

    else:
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
    shellType = get_shell_type()  # This function detects the shell type (bash or powershell)
    
    if shellType == "bash":
        # For macOS/Linux, using `vm_stat` (macOS) or `/proc/meminfo` (Linux)
        memory_command = """
        totalMemoryKB=$(sysctl -n hw.memsize)
        freeMemoryKB=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
        freeMemoryKB=$((freeMemoryKB * 4096))

        totalMemoryMB=$(echo "scale=2; $totalMemoryKB / 1024 / 1024" | bc)
        freeMemoryMB=$(echo "scale=2; $freeMemoryKB / 1024 / 1024" | bc)
        usedMemoryMB=$(echo "scale=2; $totalMemoryMB - $freeMemoryMB" | bc)

        totalMemoryGB=$(echo "scale=2; $totalMemoryMB / 1024" | bc)
        freeMemoryGB=$(echo "scale=2; $freeMemoryMB / 1024" | bc)
        usedMemoryGB=$(echo "scale=2; $usedMemoryMB / 1024" | bc)

        echo "{\"TotalMemoryGB\": \"$totalMemoryGB\", \"FreeMemoryGB\": \"$freeMemoryGB\", \"UsedMemoryGB\": \"$usedMemoryGB\"}"
        """
        memory_result = subprocess.run(memory_command, shell=True, capture_output=True, text=True)

    else:
        # For Windows, using PowerShell's `Get-WmiObject`
        memory_command = """
        $os = Get-WmiObject Win32_OperatingSystem;
        $totalMemoryMB = [math]::Round($os.TotalVisibleMemorySize / 1024, 2);
        $totalMemoryGB = [math]::Round($totalMemoryMB / 1024, 2);
        $freeMemoryMB = [math]::Round($os.FreePhysicalMemory / 1024, 2);
        $freeMemoryGB = [math]::Round($freeMemoryMB / 1024, 2);
        $usedMemoryMB = [math]::Round($totalMemoryMB - $freeMemoryMB, 2);
        $usedMemoryGB = [math]::Round($totalMemoryGB - $freeMemoryGB, 2);

        $memoryData = @{
            TotalMemoryGB = $totalMemoryGB;
            FreeMemoryGB = $freeMemoryGB;
            UsedMemoryGB = $usedMemoryGB;
        }
        $memoryData | ConvertTo-Json -Compress
        """
        memory_result = subprocess.run(
            ["powershell", "-Command", memory_command],
            capture_output=True,
            text=True
        )

    if memory_result.returncode == 0:
        try:
            memory_data = memory_result.stdout.strip()  
            memory_data = memory_data.replace("TotalMemoryGB", '"TotalMemoryGB"').replace("FreeMemoryGB", '"FreeMemoryGB"').replace("UsedMemoryGB", '"UsedMemoryGB"')
            memory_json = json.loads(memory_data)
        except json.JSONDecodeError as e:
            memory_json = {"error": f"Error parsing memory data: {str(e)}"}
    else:
        memory_json = {"error": "Unable to retrieve memory usage"}

    return jsonify(memory_json)  # Return the latest memory data
@app.route('/api/disk', methods=['GET'])
def get_disk_usage():
    shellType = get_shell_type()  # This function detects the shell type (bash or powershell)
    
    if shellType == "bash":
        # For macOS/Linux, use `df` to get disk usage
        disk_command = """
        disk_usage=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')
        echo "{\"percentage_disk_time\": \"$disk_usage\"}"
        """
        disk_result = subprocess.run(disk_command, shell=True, capture_output=True, text=True)

    else:
        # For Windows, using PowerShell's `Get-WmiObject`
        disk_command = """Get-WmiObject Win32_PerfFormattedData_PerfDisk_LogicalDisk | Where-Object { $_.Name -eq "C:" } | Select-Object -ExpandProperty PercentDiskTime"""
        disk_result = subprocess.run(["powershell", "-Command", disk_command], capture_output=True, text=True)

    # Process the result and return the JSON
    if disk_result.returncode == 0:
        try:
            disk_data = disk_result.stdout.strip()  
            # Ensure the result is in valid JSON format
            disk_data = disk_data.replace("percentage_disk_time", '"percentage_disk_time"')
            disk_json = json.loads(disk_data)  # Safely parse JSON
        except json.JSONDecodeError as e:
            disk_json = {"error": f"Error parsing disk data: {str(e)}"}
    else:
        disk_json = {"error": "Unable to retrieve disk usage"}

    return jsonify(disk_json)  # Return the latest disk data

@app.route('/api/wifi', methods=['GET'])
def get_wifi_usage():
    shell_type = get_shell_type()

    if shell_type == "bash":
        wifi_command = """
        initialStats=$(cat /sys/class/net/wlan0/statistics/rx_bytes)
        initialSent=$(cat /sys/class/net/wlan0/statistics/tx_bytes)
        sleep 1
        currentStats=$(cat /sys/class/net/wlan0/statistics/rx_bytes)
        currentSent=$(cat /sys/class/net/wlan0/statistics/tx_bytes)
        receivedBytesDelta=$((currentStats - initialStats))
        sentBytesDelta=$((currentSent - initialSent))
        totalBytesDelta=$((receivedBytesDelta + sentBytesDelta))
        throughputMbps=$(echo "scale=2; $totalBytesDelta * 8 / 1048576" | bc)
        echo "{\"SendBytes\": $sentBytesDelta, \"ReceivedBytes\": $receivedBytesDelta, \"ThroughputMbps\": $throughputMbps}"
        """
        wifi_result = subprocess.run(wifi_command, shell=True, capture_output=True, text=True)
    
    else:  # Assuming PowerShell for Windows
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

        $wifiData = @{
            "ReceivedBytes" = $receivedBytesDelta
            "SentBytes" = $sentBytesDelta
            "ThroughputMbps" = $throughputMbps
        }
        $wifiData | ConvertTo-Json -Compress
        """
        wifi_result = subprocess.run(["powershell", "-Command", wifi_command], capture_output=True, text=True)

    if wifi_result.returncode == 0:
        wifi_data = wifi_result.stdout.strip()
        print("Raw Wi-Fi Data:", wifi_data)  # Debugging output

        if wifi_data.startswith("{"):
            wifi_data = wifi_data.replace("SendBytes", '"SendBytes"').replace("ReceivedBytes", '"ReceivedBytes"').replace("ThroughputMbps", '"ThroughputMbps"')
        
        try:
            wifi_json = json.loads(wifi_data)  # Safely parse JSON
        except json.JSONDecodeError as e:
            wifi_json = {"error": f"Error parsing Wi-Fi data: {str(e)}"}
    else:
        wifi_json = {"error": "Unable to retrieve Wi-Fi statistics"}

    return jsonify(wifi_json)

if __name__ == '__main__':
    app.run(debug=True)
