import React, { useState, useEffect, createContext, useContext } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

const CPUDataContext = createContext();

function CPUDataProvider({ children }) {
  const [cpuData, setCpuData] = useState({
    utilization: null,
    speed: null,
    chartData: [],
    hasError: false,
  });

  useEffect(() => {
    const fetchCPUData = () => {
      fetch("http://127.0.0.1:5000/api/cpu")
        .then((response) =>
          response.ok ? response.json() : Promise.reject(response)
        )
        .then((data) => {
          const formattedData = data.slice(-30).map((entry) => ({
            time: new Date(entry.date).getTime(),
            utilization: parseFloat(entry.usage) || 0,
          }));
          setCpuData({
            chartData: formattedData,
            utilization: data.at(-1)?.usage ?? null,
            speed: data.at(-1)?.speed ?? null,
            hasError: false,
          });
        })
        .catch(() => setCpuData((prev) => ({ ...prev, hasError: true })));
    };

    fetchCPUData();
    const interval = setInterval(fetchCPUData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <CPUDataContext.Provider value={cpuData}>
      {children}
    </CPUDataContext.Provider>
  );
}

function CPUUsage() {
  const { utilization, speed, chartData, hasError } =
    useContext(CPUDataContext);

  if (hasError)
    return <h2>Error loading CPU data. Check server connection.</h2>;
  if (!chartData.length) return <h2>Loading CPU data...</h2>;

  const formatXAxis = (tickItem) =>
    new Date(tickItem).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  return (
    <div style={{ border: "1px solid black", backgroundColor: "white" }}>
      <h1>CPU Utilization: {utilization ? `${utilization}%` : "Loading..."}</h1>
      <h1>CPU Speed: {speed ? `${speed} GHz` : "Loading..."}</h1>

      <LineChart width={500} height={300} data={chartData}>
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="time" tickFormatter={formatXAxis} />
        <YAxis
          label={{
            value: "CPU Utilization (%)",
            angle: -90,
            position: "insideLeft",
          }}
        />
        <Tooltip
          labelFormatter={formatXAxis}
          formatter={(value) => `${value}%`}
        />
        <Line type="monotone" dataKey="utilization" stroke="#8884d8" />
      </LineChart>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={createTheme()}>
      <CssBaseline />
      <CPUDataProvider>
        <CPUUsage />
      </CPUDataProvider>
    </ThemeProvider>
  );
}