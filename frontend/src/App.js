import React, { useState } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  MenuItem,
  Select,
} from "@mui/material";
import CPUUsage from "./components/CPUUsage";
import DiskUsage from "./components/DiskUsage";
import WiFiUsage from "./components/WiFiUsage";

function App() {
  const [selectedOption, setSelectedOption] = useState("");

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };

  return (
    <ThemeProvider theme={createTheme()}>
      <CssBaseline />
      <div style={{ margin: "20px" }}>
        <h1>System Monitor</h1>
        <Select
          value={selectedOption}
          onChange={handleChange}
          displayEmpty
          style={{ minWidth: "200px", marginBottom: "20px" }}
        >
          <MenuItem value="" disabled>
            Select a Metric
          </MenuItem>
          <MenuItem value="cpu">CPU Usage</MenuItem>
          <MenuItem value="disk">Disk Usage</MenuItem>
          <MenuItem value="wifi">WiFi Usage</MenuItem>
        </Select>

        {selectedOption === "cpu" && <CPUUsage />}
        {selectedOption === "disk" && <DiskUsage />}
        {selectedOption === "wifi" && <WiFiUsage />}
      </div>
    </ThemeProvider>
  );
}

export default App;
