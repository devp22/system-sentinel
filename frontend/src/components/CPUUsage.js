import React, { useState, useEffect, createContext, useContext } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Label,
} from "recharts";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

const CPUDataContext = createContext();

function CPUDataProvider({ children }) {
  const [CPUData, setCPUData] = useState({
    usage: null,
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
          // Prepare data for the chart
          const formattedData = [
            {
              time: Date.now(),
              usage: parseFloat(data.usage) || 0,
              speed: parseFloat(data.speed) || 0,
            },
          ];

          setCPUData((prev) => ({
            chartData: [...prev.chartData.slice(-30), ...formattedData],
            usage: formattedData[0].usage,
            speed: formattedData[0].speed,
            hasError: false,
          }));
        })
        .catch(() =>
          setCPUData((prev) => ({
            ...prev,
            hasError: true,
          }))
        );
    };

    fetchCPUData();
    const interval = setInterval(fetchCPUData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <CPUDataContext.Provider value={CPUData}>
      {children}
    </CPUDataContext.Provider>
  );
}

function CPUUsage() {
  const { usage, speed, chartData, hasError } = useContext(CPUDataContext);

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
    <div
      style={{
        border: "3px solid pink",
        backgroundColor: "#fcd0cc",
        borderRadius: "10px",
        margin: 5,
        paddingTop: 10,
      }}
    >
      <LineChart
        width={400}
        height={200}
        data={chartData}
        margin={{ top: 30, right: 50, left: 5, bottom: 0 }}
        padding={10}
      >
        <CartesianGrid strokeLinecap="3 3" />
        <XAxis dataKey="time" tickFormatter={formatXAxis}></XAxis>
        <YAxis>
          <Label
            style={{
              textAnchor: "middle",
              fontSize: "100%",
              fill: "black",
            }}
            angle={-90}
            value={"CPU Usage (in %)"}
          />
        </YAxis>
        <Tooltip
          labelFormatter={formatXAxis}
          formatter={(value) => `${value} %`}
        />
        <Line type="monotone" dataKey="usage" stroke="#8884d8" />
      </LineChart>
      <h4 style={{ color: "black" }}>
        CPU Usage: {usage ? `${usage}` : "Loading..."} %
      </h4>
      <h4 style={{ color: "black" }}>
        Speed: {speed ? `${speed}` : "Loading..."} GHz
      </h4>
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
