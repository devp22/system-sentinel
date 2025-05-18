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

const WiFiDataContext = createContext();

function WiFiDataProvider({ children }) {
  const [WiFiData, setWiFiData] = useState({
    received_bytes: null,
    sent_bytes: null,
    throughputMBpS: null,
    chartData: [],
    hasError: false,
  });

  useEffect(() => {
    const fetchWiFiData = () => {
      fetch("http://127.0.0.1:5000/api/wifi")
        .then((response) =>
          response.ok ? response.json() : Promise.reject(response)
        )
        .then((data) => {
          const formattedData = [
            {
              time: Date.now(),
              throughputMBpS: parseFloat(data.ThroughputMbps).toFixed(2) || 0,
              received_bytes:
                (parseFloat(data.ReceivedBytes) / 1024).toFixed(2) || 0,
              sent_bytes: (parseFloat(data.SentBytes) / 1024).toFixed(2) || 0,
            },
          ];

          setWiFiData((prev) => ({
            chartData: [...prev.chartData.slice(-30), ...formattedData],
            throughputMBpS: formattedData[0].throughputMBpS,
            received_bytes: formattedData[0].received_bytes,
            sent_bytes: formattedData[0].sent_bytes,
            hasError: false,
          }));
        })
        .catch(() =>
          setWiFiData((prev) => ({
            ...prev,
            hasError: true,
          }))
        );
    };

    fetchWiFiData();
    const interval = setInterval(fetchWiFiData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <WiFiDataContext.Provider value={WiFiData}>
      {children}
    </WiFiDataContext.Provider>
  );
}

function WiFiUsage() {
  const { throughputMBpS, received_bytes, sent_bytes, chartData, hasError } =
    useContext(WiFiDataContext);

  if (hasError)
    return <h2>Error loading WiFi data. Check server connection.</h2>;
  if (!chartData.length) return <h2>Loading WiFi data...</h2>;

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
            value={"Throughput (in MB)"}
          />
        </YAxis>
        <Tooltip
          labelFormatter={formatXAxis}
          formatter={(value) => `${value} MB`}
        />
        <Line type="monotone" dataKey="throughputMBpS" stroke="#8884d8" />
      </LineChart>
      <h4 style={{ color: "black" }}>
        Sent: {sent_bytes ? `${sent_bytes} (Kbps)` : "Loading..."}
      </h4>
      <h4 style={{ color: "black" }}>
        Received: {received_bytes ? `${received_bytes} (Kbps)` : "Loading..."}
      </h4>
      <h4 style={{ color: "black" }}>
        Throughput: {throughputMBpS ? `${throughputMBpS} (Mbps)` : "Loading..."}
      </h4>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={createTheme()}>
      <CssBaseline />
      <WiFiDataProvider>
        <WiFiUsage />
      </WiFiDataProvider>
    </ThemeProvider>
  );
}
