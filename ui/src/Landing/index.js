import React, { useState } from "react";

import { useHistory } from "react-router-dom";
import Autocomplete from "../Autocomplete";
import "./landing.css";
import Notification from "../Notifications";

const AREAS = [
  "Toronto",
  "Etobicoke",
  "Misssuaga",
  "Brampton",
  "Vaughan",
  "East York",
  "North York",
  "Scarborough",
  "Markham",
  "Whitby",
  "Richmond Hill",
];

const areaMap = {
  Toronto: [-79.3872, 43.6539],
  Etobicoke: [-79.5648, 43.6435],
  Misssuaga: [-79.6454, 43.5899],
  Brampton: [-79.7521, 43.7155],
  Vaughan: [-79.6294, 43.7022],
  "East York": [-79.3279, 43.6909],
  "North York": [-79.4126, 43.771],
  Scarborough: [-79.257, 43.7729],
  Markham: [-79.327, 43.8541],
  "Richmond Hill": [-79.4393, 43.8797],
  Whitby: [-78.9371, 43.8984],
};

const LandingPage = () => {
  const [location, setLocation] = useState(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const history = useHistory();

  const acquireCurrentLocation = () => {
    setFetchingLocation(true);
    const options = {
      enableHighAccuracy: true,
      timeout: 6000,
      maximumAge: 0,
    };
    const success = (pos) => {
      setFetchingLocation(false);
      var crd = pos.coords;
      const coords = [crd.longitude, crd.latitude];
      // history.push({ pathname: "/locate", state: { coords } });
      Notification({
        type: "success",
        message: "Location Acquired",
        onClose: () => {
          history.push({ pathname: "/locate", state: { coords } });
        },
      });
    };

    const errors = (err) => {
      console.warn(`GEOLOCATION:: ERROR:: (${err.code}): ${err.message}`);
    };
    if (navigator.geolocation) {
      if (navigator?.permissions?.query) {
        navigator.permissions
          .query({ name: "geolocation" })
          .then(function (result) {
            if (result.state === "granted") {
              navigator.geolocation.getCurrentPosition(success, errors);
            }
            if (result.state === "prompt") {
              navigator.geolocation.getCurrentPosition(
                success,
                errors,
                options
              );
            }
            if (result.state === "denied") {
              console.log("Geolocation Denied by user");
            }
            result.onchange = function () {
              console.log(`Geo Location on Change`, result.state);
            };
          });
      } else {
        navigator.geolocation.getCurrentPosition(success, errors, options);
      }
    } else {
      console.log("Cannot access Geo Location");
    }
  };

  const handleFind = () => {
    if (location === "Current Location") {
      acquireCurrentLocation();
      return;
    }
    let coords = areaMap[location];
    if (!coords) {
      coords = [-79.3872, 43.6539];
    }

    history.push({ pathname: "/locate", state: { coords } });
  };

  return (
    <div className="landing-image">
      <div className="landing-overlay">
        <div className="container">
          <div className="row mb-2">
            <div className="col" />
            <div className="col-sm-8">
              <h2 className="text-center display-4">Find Me a School</h2>
            </div>
            <div className="col" />
          </div>
          <div className="row">
            <div className="col" />
            <div className="col-sm-12 typewriter">
              <p className="lead font-weight-bold text-center">
                Find your next school in Greater Toronto Area(GTA)
              </p>
            </div>
            <div className="col" />
          </div>
          <div className="row align-items-center p-2">
            <div className="col" />
            <div className="col-sm-6">
              <Autocomplete
                suggestions={AREAS}
                onSelected={(text) => {
                  console.log("Selected Text", text);
                  setLocation(text);
                }}
              />
            </div>
            <div className="col" />
          </div>
          <div className="row align-items-center p-2">
            <div className="col" />
            <div className="col-sm-6">
              <button
                className="btn btn-primary btn-lg w-100"
                onClick={handleFind}
                disabled={fetchingLocation}
              >
                {fetchingLocation ? (
                  <div class="spinner-border text-light" role="status">
                    <span class="sr-only">Locating You...</span>
                  </div>
                ) : (
                  <span>Find</span>
                )}
              </button>
            </div>
            <div className="col" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
