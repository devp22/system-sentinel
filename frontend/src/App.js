import logo from "./logo.svg";
import "./App.css";
import CPUUsage from "./CPUUsage";
import LandingPage from "./LandingPage";

function App() {
  return (
    <div className="App">
      <table>
        <tr>
          <td>
            <LandingPage></LandingPage>
          </td>
        </tr>
      </table>
    </div>
  );
}

export default App;
