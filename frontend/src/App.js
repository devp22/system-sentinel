import logo from "./logo.svg";
import "./App.css";
import CPUUsage from "./CPUUsage";


function App() {
  return (
    <div className="App">
      <table>
        <tr>
          <td>
            <CPUUsage></CPUUsage>
          </td>
        </tr>
      </table>
    </div>
  );
}

export default App;
