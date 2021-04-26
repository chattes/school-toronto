import { Switch, Route, Link } from "react-router-dom";
import Maps from "./Maps";
import LandingPage from "./Landing";
import { ToastContainer, toast } from "react-toastify";

function App() {
  console.log("Added this log");
  return (
    <div className="App">
      <Switch>
        <Route exact path="/">
          <LandingPage />
        </Route>
        <Route exact path="/locate">
          <Maps />
        </Route>
        <Route path="*">
          <div className="d-flex align-items-center justify-content-center flex-column mt-5">
            <h1>This resource does not exist</h1>
            <Link to="/">Back to Home</Link>
          </div>
        </Route>
      </Switch>
      <ToastContainer />
    </div>
  );
}

export default App;
