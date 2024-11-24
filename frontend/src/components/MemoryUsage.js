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

const MemoryDataContext = createContext();

function MemoryDataProvider({ children }) {
  const [MemoryData, setMemoryData] = useState({
    free: null,
    used: null,
    total: null,
    chartData: [],
    hasError: false,
  });

  useEffect(() => {
    const fetchMemoryData = () => {
      fetch("http://127.0.0.1:5000/api/memory")
        .then((response) =>
          response.ok ? response.json() : Promise.reject(response)
        )
        .then((data) => {
          // Prepare data for the chart
          const formattedData = [
            {
              time: Date.now(),
              total: parseFloat(data.TotalMemoryGB) || 0,
              free: parseFloat(data.FreeMemoryGB) || 0,
              used: parseFloat(data.UsedMemoryGB) || 0,
            },
          ];

          setMemoryData((prev) => ({
            chartData: [...prev.chartData.slice(-30), ...formattedData],
            total: formattedData[0].total,
            free: formattedData[0].free,
            used: formattedData[0].used,
            hasError: false,
          }));
        })
        .catch(() =>
          setMemoryData((prev) => ({
            ...prev,
            hasError: true,
          }))
        );
    };

    fetchMemoryData();
    const interval = setInterval(fetchMemoryData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <MemoryDataContext.Provider value={MemoryData}>
      {children}
    </MemoryDataContext.Provider>
  );
}

function MemoryUsage() {
  const { total, free, used, chartData, hasError } =
    useContext(MemoryDataContext);

  if (hasError)
    return <h2>Error loading Memory data. Check server connection.</h2>;
  if (!chartData.length) return <h2>Loading Memory data...</h2>;

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
            value={"Used Memory (in GB)"}
          />
        </YAxis>
        <Tooltip
          labelFormatter={formatXAxis}
          formatter={(value) => `${value} GB`}
        />
        <Line type="monotone" dataKey="used" stroke="#8884d8" />
      </LineChart>
      <h4 style={{ color: "black" }}>
        In Used: {used ? `${used}` : "Loading..."} GB
      </h4>
      <h4 style={{ color: "black" }}>
        Available: {free ? `${free}` : "Loading..."} GB
      </h4>
      <h4 style={{ color: "black" }}>
        Total: {total ? `${total}` : "Loading..."} GB
      </h4>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={createTheme()}>
      <CssBaseline />
      <MemoryDataProvider>
        <MemoryUsage />
      </MemoryDataProvider>
    </ThemeProvider>
  );
}
