import React from "react";
import ReactDOM from "react-dom";
import { RecoilRoot } from "recoil";
import Map from "./Maps";
import reportWebVitals from "./reportWebVitals";
import GeoLocationProvider from "./Context/GeoLocation";
import SchoolSettingsProvider from "./Context/Settings";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";

ReactDOM.render(
  <React.StrictMode>
    <RecoilRoot>
      <SchoolSettingsProvider>
        <Router>
          <App />
        </Router>
      </SchoolSettingsProvider>
    </RecoilRoot>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// console.log("Reporting Web Vitals!");
eportWebVitals();
