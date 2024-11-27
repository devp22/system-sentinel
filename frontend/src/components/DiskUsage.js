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

const DiskDataContext = createContext();

function DiskDataProvider({ children }) {
  const [DiskData, setDiskData] = useState({
    percentage_disk_time: null,
    chartData: [],
    hasError: false,
  });

  useEffect(() => {
    const fetchDiskData = () => {
      fetch("http://127.0.0.1:5000/api/disk")
        .then((response) =>
          response.ok ? response.json() : Promise.reject(response)
        )
        .then((data) => {
          // Prepare data for the chart
          const formattedData = [
            {
              time: Date.now(),
              percentage_disk_time: parseFloat(data.percentage_disk_time) || 0,
            },
          ];

          setDiskData((prev) => ({
            chartData: [...prev.chartData.slice(-30), ...formattedData],
            percentage_disk_time: formattedData[0].percentage_disk_time,
            hasError: false,
          }));
        })
        .catch(() =>
          setDiskData((prev) => ({
            ...prev,
            hasError: true,
          }))
        );
    };

    fetchDiskData();
    const interval = setInterval(fetchDiskData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DiskDataContext.Provider value={DiskData}>
      {children}
    </DiskDataContext.Provider>
  );
}

function DiskUsage() {
  const { percentage_disk_time, chartData, hasError } =
    useContext(DiskDataContext);

  if (hasError)
    return <h2>Error loading Disk data. Check server connection.</h2>;
  if (!chartData.length) return <h2>Loading Disk data...</h2>;

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
            value={"Disk Usage (in %)"}
          />
        </YAxis>
        <Tooltip
          labelFormatter={formatXAxis}
          formatter={(value) => `${value} %`}
        />
        <Line type="monotone" dataKey="percentage_disk_time" stroke="#8884d8" />
      </LineChart>
      <h4 style={{ color: "black" }}>
        Disk Usage:{" "}
        {percentage_disk_time ? `${percentage_disk_time}` : "Loading..."} %
      </h4>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={createTheme()}>
      <CssBaseline />
      <DiskDataProvider>
        <DiskUsage />
      </DiskDataProvider>
    </ThemeProvider>
  );
}
