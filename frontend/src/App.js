import logo from "./logo.svg";
import "./App.css";
import CPUUsage from "./components/CPUUsage";
import MemoryUsage from "./components/MemoryUsage";
import DiskUsage from "./components/DiskUsage";
import WiFiUsage from "./components/WiFiUsage";

function App() {
  return (
    <div className="App">
      <table>
        <tr>
          <td>
            <CPUUsage></CPUUsage>
          </td>
          <td>
            <DiskUsage></DiskUsage>
          </td>
          <td>
            <MemoryUsage></MemoryUsage>
          </td>
          <td>
            <WiFiUsage></WiFiUsage>
          </td>
        </tr>
      </table>
    </div>
  );
}

export default App;
