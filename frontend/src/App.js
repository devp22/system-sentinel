import logo from "./logo.svg";
import "./App.css";
import CPUUsage from "./components/CPUUsage";
import MemoryUsage from "./components/MemoryUsage";

function App() {
  return (
    <div className="App">
      <table>
        <tr>
          <td>
            <CPUUsage></CPUUsage>
          </td>
          <td>
            <MemoryUsage></MemoryUsage>
          </td>
        </tr>
      </table>
    </div>
  );
}

export default App;
