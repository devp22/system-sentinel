import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import CPUUsage from "./components/CPUUsage";
import MemoryUsage from "./components/MemoryUsage";
import DiskUsage from "./components/DiskUsage";
import WiFiUsage from "./components/WiFiUsage";

function App() {
  const [cpuUsageThreshold, setCpuUsageThreshold] = useState(80); // Initial threshold value
  const [alertShown, setAlertShown] = useState(false);
  const [inputValue, setInputValue] = useState(cpuUsageThreshold); // Manage input field value
  const [cpuUsage, setCpuUsage] = useState(null); // Store CPU usage to check against threshold

  // Fetch CPU data and update usage
  useEffect(() => {
    const fetchCPUData = () => {
      fetch("http://127.0.0.1:5000/api/cpu")
        .then((response) =>
          response.ok ? response.json() : Promise.reject(response)
        )
        .then((data) => {
          const currentUsage = parseFloat(data.usage) || 0;
          setCpuUsage(currentUsage);
        })
        .catch(() => {
          console.error("Error loading CPU data.");
        });
    };

    fetchCPUData();
    const interval = setInterval(fetchCPUData, 2000); // Fetch every 2 seconds
    return () => clearInterval(interval); // Clean up the interval when the component is unmounted
  }, []);

  // Function to check if CPU usage exceeds the threshold
  const checkCPUUsage = (usage) => {
    if (usage > cpuUsageThreshold && !alertShown) {
      alert(`Warning: CPU usage exceeds ${cpuUsageThreshold}%`);
      setAlertShown(true); // Prevent repeated alerts
    }
  };

  // Function to update the threshold
  const updateThreshold = () => {
    const newThreshold = parseFloat(inputValue);
    if (!isNaN(newThreshold) && newThreshold >= 0 && newThreshold <= 100) {
      setCpuUsageThreshold(newThreshold);
      setAlertShown(false); // Reset alertShown to allow alerts again after updating threshold
    } else {
      alert("Please enter a valid threshold between 0 and 100.");
    }
  };

  // Check the CPU usage against the threshold
  useEffect(() => {
    if (cpuUsage !== null) {
      checkCPUUsage(cpuUsage);
    }
  }, [cpuUsage]);

  return (
    <div className="App">
      <table>
        <tr>
          <td>
            <CPUUsage cpuUsage={cpuUsage} />
          </td>
          <td>
            <DiskUsage />
          </td>
          <td>
            <MemoryUsage />
          </td>
          <td>
            <WiFiUsage />
          </td>
        </tr>
      </table>

      <div style={{ marginTop: "20px" }}>
        <h3>Set CPU Usage Threshold</h3>
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          min="0"
          max="100"
          step="1"
          style={{ padding: "5px", width: "60px" }}
        />
        <button
          onClick={updateThreshold}
          style={{
            padding: "5px 10px",
            marginLeft: "10px",
            cursor: "pointer",
            backgroundColor: "#4CAF50",
            color: "white",
          }}
        >
          Set Threshold
        </button>
      </div>
    </div>
  );
}

export default App;
