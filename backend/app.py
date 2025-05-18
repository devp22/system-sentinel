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
    is_windows = platform.system() == "Windows"

    try:
        if is_windows:
            memory_command = """
            $os = Get-WmiObject Win32_OperatingSystem
            $totalMemoryMB = [math]::Round($os.TotalVisibleMemorySize / 1024, 2)
            $freeMemoryMB = [math]::Round($os.FreePhysicalMemory / 1024, 2)
            $usedMemoryMB = [math]::Round($totalMemoryMB - $freeMemoryMB, 2)
            $totalMemoryGB = [math]::Round($totalMemoryMB / 1024, 2)
            $freeMemoryGB = [math]::Round($freeMemoryMB / 1024, 2)
            $usedMemoryGB = [math]::Round($usedMemoryMB / 1024, 2)

            $memoryData = @{
                "TotalMemoryGB" = $totalMemoryGB
                "FreeMemoryGB"  = $freeMemoryGB
                "UsedMemoryGB"  = $usedMemoryGB
            }
            $memoryData | ConvertTo-Json -Compress
            """
            memory_result = subprocess.run(
                ["powershell", "-Command", memory_command],
                capture_output=True, text=True
            )
        else:
            memory_command = """
            total=$(sysctl -n hw.memsize)
            free=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\\.//')
            free=$((free * 4096))

            total_gb=$(echo "scale=2; $total / 1024 / 1024 / 1024" | bc)
            free_gb=$(echo "scale=2; $free / 1024 / 1024 / 1024" | bc)
            used_gb=$(echo "scale=2; $total_gb - $free_gb" | bc)

            echo "{\\"TotalMemoryGB\\": $total_gb, \\"FreeMemoryGB\\": $free_gb, \\"UsedMemoryGB\\": $used_gb}"
            """
            memory_result = subprocess.run(memory_command, shell=True, capture_output=True, text=True)

        if memory_result.returncode == 0:
            memory_json = json.loads(memory_result.stdout.strip())
        else:
            memory_json = {"error": "Unable to retrieve memory usage"}

    except Exception as e:
        memory_json = {"error": f"Exception occurred: {str(e)}"}

    return jsonify(memory_json)

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
    disk_final_data = {
            "percentage_disk_time": disk_json
        }
    return jsonify(disk_final_data)  # Return the latest disk data

@app.route('/api/wifi', methods=['GET'])
def get_wifi_usage():
    is_windows = platform.system() == "Windows"

    try:
        if is_windows:
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
            wifi_result = subprocess.run(
                ["powershell", "-Command", wifi_command],
                capture_output=True, text=True
            )
        else:
            wifi_command = """
            rx1=$(cat /sys/class/net/wlan0/statistics/rx_bytes)
            tx1=$(cat /sys/class/net/wlan0/statistics/tx_bytes)
            sleep 1
            rx2=$(cat /sys/class/net/wlan0/statistics/rx_bytes)
            tx2=$(cat /sys/class/net/wlan0/statistics/tx_bytes)
            rx_delta=$((rx2 - rx1))
            tx_delta=$((tx2 - tx1))
            total_delta=$((rx_delta + tx_delta))
            mbps=$(echo "scale=2; $total_delta * 8 / 1048576" | bc)
            echo "{\\"ReceivedBytes\\": $rx_delta, \\"SentBytes\\": $tx_delta, \\"ThroughputMbps\\": $mbps}"
            """
            wifi_result = subprocess.run(wifi_command, shell=True, capture_output=True, text=True)

        if wifi_result.returncode == 0:
            wifi_data_raw = wifi_result.stdout.strip()
            wifi_json = json.loads(wifi_data_raw)
        else:
            wifi_json = {"error": "Unable to retrieve Wi-Fi statistics"}

    except json.JSONDecodeError as e:
        wifi_json = {"error": f"JSON decode error: {str(e)}"}
    except Exception as e:
        wifi_json = {"error": f"Exception occurred: {str(e)}"}

    return jsonify(wifi_json)

if __name__ == '__main__':
    app.run(debug=True)
