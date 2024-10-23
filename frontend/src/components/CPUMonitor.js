import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';

const CpuMonitor = () => {
  const [data, setData] = useState([]);
  const [threshold, setThreshold] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios('/api/cpu');
      setData(result.data);
    };

    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>CPU Monitor</h2>
      <Line data={data} />
      <input
        type="number"
        value={threshold}
        onChange={(e) => setThreshold(e.target.value)}
        placeholder="Set CPU threshold"
      />
      {/* Add alert logic based on threshold */}
    </div>
  );
};

export default CpuMonitor;
