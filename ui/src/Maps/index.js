import { useRef, useState, useEffect, useContext } from "react";
import mapboxgl from "mapbox-gl/dist/mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import httpHelper from "../api";
import config from "../Config";
import circle from "@turf/circle";
import linestring from "turf-linestring";
import bbox from "@turf/bbox";
import bboxPolygon from "@turf/bbox-polygon";
import "./maps.css";
import filter from "../assets/filter.svg";
import SearchFilter from "../SearchFilters";
import { useLocation } from "react-router-dom";
import { SchoolSettings } from "../Context/Settings";
import { FeedbackFish } from "@feedback-fish/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

import { faHandsHelping, faComments } from "@fortawesome/free-solid-svg-icons";

import { Modal, Button } from "react-bootstrap";
mapboxgl.accessToken = "";

const Maps = () => {
  const mapContainer = useRef();
  const location = useLocation();
  const [lng, setLng] = useState(-79.47);
  const [lat, setLat] = useState(43.68);
  const [zoom, setZoom] = useState(12);
  const [mapRef, setMapRef] = useState(null);
  const [schoolsCollection, setSchools] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedSchoolHover, setSelectedSchoolHover] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [windowsOpen, setWindowsOpen] = useState([]);
  const [queryTO, setQueryTO] = useState(null);
  const { schoolSettings } = useContext(SchoolSettings);

  const handleClose = () => {
    setShowDetails(false);
    setSelectedSchool(null);
    windowsOpen.forEach((w) => w.close());
    setWindowsOpen([]);
  };
  const handleShow = () => setShowDetails(true);
  const handleShowFilter = () => setShowFilter(true);
  const handleCloseFilter = () => setShowFilter(false);
  // Show Listings
  const showListings = () => {
    windowsOpen.forEach((w) => w.close());
    setWindowsOpen([]);
    let openWindows = [];
    console.log(selectedSchool);
    const { bboxPoi, bboxPolygonPoi } = getBBox(selectedSchool.coords);
    const latSchool = selectedSchool.coords[0];
    const lngSchool = selectedSchool.coords[1];
    console.log("Polygon", bboxPolygonPoi);
    console.log(bboxPoi.toString());
    console.log("Min BedRoom", schoolSettings.minBedRoom);
    let bedRoomRentals = `beds=${schoolSettings.minBedRoom}&`;
    let bedroomRange = `[`;
    let bedRoomZumper = `${schoolSettings.minBedRoom}+beds`;
    if (schoolSettings.minBedRoom > 1) {
      for (let i = schoolSettings.minBedRoom; i < 5; i++) {
        bedroomRange = `${bedroomRange}${i.toString()},`;
      }
    } else {
      bedroomRange = `["1", "2", "3", "4", "5"]`;
    }
    let bedRoomRangeMod = bedroomRange.slice(0, -1);
    bedRoomRangeMod = `${bedRoomRangeMod}]`;
    const zumperUrl = `https://www.zumper.com/apartments-for-rent/toronto-on/${bedRoomZumper}?box=${bboxPoi.toString()}`;
    const rentalsUrl = `https://rentals.ca/toronto?${bedRoomRentals}bbox=${bboxPoi.toString()}`;
    const hSigmaUrl = `https://housesigma.com/web/en/map?listing_days=0&sold_days=90&de_list_days=90&house_type=["C.","S.","D.","A."]&list_type=[2]&listing_price=[0,6000000]&rent_price=[0,3000]&bedroom_range=${bedRoomRangeMod}&bathroom_min=0&garage_min=0&basement=[]&max_maintenance_fee=0&school_condition={"elementary":1,"secondary":0,"public":1,"catholic":1,"match_score":0}&show_school=1&show_comparision=0&square_footage=[0,4000]&front_feet=[0,100]&open_house_date=0&description=&zoom=17&center={"lat":${lngSchool},"lng":${latSchool}}`;
    const condosCaUrl = `https://condos.ca/toronto/condos-for-rent?beds=2.1-2.9,3-99&bathrooms=2&size_range=1000,999999999&rent_price_range=0,2700&parking_spots_min=1&polygon=-79.37169002284763%2043.79153443220775,-79.37568180547913%2043.78088059757795,-79.35880745162777%2043.78122993373874,-79.3548156689963%2043.78913311885764,-79.37169002284763%2043.79153443220775`;

    openWindows.push(window.open(hSigmaUrl, "_blank"));
    openWindows.push(window.open(zumperUrl, "_blank"));
    openWindows.push(window.open(rentalsUrl, "_blank"));
    setWindowsOpen(openWindows);
  };

  // Get Users Location if possible
  const fetchSchoolsByLocation = (lat, lng, zoom) => {
    if (queryTO) {
      clearTimeout(queryTO);
    }
    let radius = 5000;
    if (zoom > 16) {
      radius = 1000;
    }
    if (zoom > 13 && zoom <= 16) {
      radius = 2000;
    }
    if (zoom > 10 && zoom <= 13) {
      radius = 3000;
    }

    const makeQuery = () =>
      httpHelper
        .post({
          url: "/school/coords",
          body: {
            coords: {
              latitude: parseFloat(lat),
              longitude: parseFloat(lng),
            },
            radiusInMeters: radius,
          },
        })
        .then((response) => {
          const schoolsResults = response?.data?.schools || [];
          setSchools(generateGeoJSON(schoolsResults, schoolSettings));
        })
        .catch((error) => console.log("ERRROR", error));

    const queryTimeOut = setTimeout(() => {
      makeQuery();
    }, 500);
    setQueryTO(queryTimeOut);
  };
  const setupMap = () => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: config.mapStyle,
      center: [lng, lat],
      zoom: zoom,
      maxZoom: 18,
      minZoom: 10,
    });
    map.on("load", () => {
      setMapRef(map);
      // map.loadImage(location, (err, image) => {
      //   if (err) throw err;
      //   map.addImage("custom-marker", image);
      // });
      map.on("move", () => {
        setLng(map.getCenter().lng.toFixed(4));
        setLat(map.getCenter().lat.toFixed(4));
        setZoom(map.getZoom().toFixed(2));
      });

      map.on("click", (e) => {
        e.preventDefault();
        const { lng, lat } = e.lngLat;

        setLng(lng.toFixed(4));
        setLat(lat.toFixed(4));
        setZoom(map.getZoom().toFixed(2));
      });
    });

    return map;
  };

  useEffect(() => {
    const map = setupMap();
    return () => map.remove();
  }, []);

  useEffect(() => {
    if (lat && lng) {
      fetchSchoolsByLocation(lat, lng, zoom);
    }
  }, [lat, lng, zoom, schoolSettings]);

  useEffect(() => {
    if (mapRef && schoolsCollection) {
      console.log("Start Plotting schools", schoolsCollection);
      try {
        mapRef.removeLayer("schools");
        mapRef.removeSource("schools");
      } catch (error) {
        console.log("Source not removed");
      }
      mapRef.addSource("schools", {
        type: "geojson",
        data: schoolsCollection,
      });

      // const ratinglt70 = ["<", ["get", "eqaoRating"], "75"];
      // const schoolBoard = ["==", ["get", "board"], "tdsb"];

      mapRef.addLayer({
        id: "schools",
        type: "circle",
        source: "schools",
        // layout: {
        //   "icon-image": "{markerImage}",
        //   "icon-size": 0.04,
        //   // get the title name from the source's "title" property
        // },
        paint: {
          // "circle-color": ["case", ratinglt70, "#e08931", "#468847"],
          "circle-color": { type: "identity", property: "color" },
          "circle-radius": {
            base: 1.75,
            stops: [
              [12, 6],
              [22, 80],
            ],
          },
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });
      mapRef.setPaintProperty("schools", "circle-color", {
        type: "identity",
        property: "markerColor",
      });

      mapRef.on("click", "schools", (e) => {
        console.log("Name:: ", e.features[0].properties.name);
        console.log("Name:: ", e.features[0].properties.id);
        const properties = e.features[0].properties;
        const coords = e.features[0].geometry.coordinates;
        mapRef.flyTo({
          center: coords,
          zoom: 13,
          bearing: 0,
          speed: 0.7,
          curve: 1,
          easing: function (t) {
            return t;
          },
          // this animation is considered essential with respect to prefers-reduced-motion
          essential: true,
        });
        setSelectedSchool({
          coords,
          properties,
        });
        handleShow();
      });

      // Change the cursor to a pointer when the it enters a feature in the 'circle' layer.
      mapRef.on("mouseenter", "schools", function (e) {
        mapRef.getCanvas().style.cursor = "pointer";
        const properties = e.features[0].properties;
        const coords = e.features[0].geometry.coordinates;
        setSelectedSchoolHover({
          coords,
          properties,
        });
      });

      // Change it back to a pointer when it leaves.
      mapRef.on("mouseleave", "schools", function () {
        mapRef.getCanvas().style.cursor = "";
        setSelectedSchoolHover(null);
      });
    }
  }, [schoolsCollection, mapRef]);

  useEffect(() => {
    if (location?.state?.coords && mapRef) {
      const myCoords = location.state.coords;
      mapRef.flyTo({
        center: myCoords.map((x) => x.toFixed(4)),
        zoom: 13,
        bearing: 0,
        speed: 0.7,
        curve: 1,
        easing: function (t) {
          return t;
        },
        // this animation is considered essential with respect to prefers-reduced-motion
        essential: true,
      });
      new mapboxgl.Marker({ scale: 0.8 }).setLngLat(myCoords).addTo(mapRef);
    }
  }, [location, mapRef]);

  const boxText = selectedSchoolHover
    ? `
           Name: ${selectedSchoolHover.properties.name} | EQAO: ${selectedSchoolHover.properties.eqaoRating}
  `
    : `Longitude: ${lng} | Latitude: ${lat}`;

  return (
    <div>
      {/* <div className="sidebar">
        {selectedSchoolHover ? (
          <p className="school-ellipsis">
            Name: {selectedSchoolHover.properties.name} | EQAO:{" "}
            {selectedSchoolHover.properties.eqaoRating} | Board:{" "}
            {selectedSchoolHover.properties.board}
          </p>
        ) : (
          <p>
            Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
          </p>
        )}
      </div> */}
      <div className="sidebar school-ellipsis">{boxText}</div>

      <div className="topbar">
        <h4 className="title ml-2">Find Me a School</h4>
        <div className="feedback">
          <Link to="/about" className="mr-3 cta">
            About
          </Link>
          <FeedbackFish projectId="d4ebb7a92bddd7">
            <a className="mr-3 cta" href="#">
              Feedback
            </a>
          </FeedbackFish>
        </div>
      </div>

      <div className="map-container" ref={mapContainer} />
      <Modal show={showDetails} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedSchool?.properties?.name || ""}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-column align-items-center justify-content-center">
            <p>
              <strong>Board: </strong>
              <span className="text-uppercase">
                {selectedSchool?.properties?.board}
              </span>
            </p>
            <p>
              <strong>School Type: </strong>
              <span className="text-capitalize">
                {selectedSchool?.properties?.level}
              </span>
            </p>
            <p>
              <strong>Language: </strong>
              <span className="text-capitalize">
                {selectedSchool?.properties?.language}
              </span>
            </p>
            <blockquote>
              <small>EQAO GTA School Rating: </small>
              {selectedSchool?.properties?.eqaoRating}
            </blockquote>
            <p>
              <small>Fraser Rating: </small>
              {selectedSchool?.properties?.fraserRating || "N/A"}
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={showListings}>Search Listings</Button>
        </Modal.Footer>
      </Modal>

      <SearchFilter
        showFilter={showFilter}
        handleCloseFilter={handleCloseFilter}
      />

      <img
        src={filter}
        className="settings"
        alt="settings"
        onClick={handleShowFilter}
      />
    </div>
  );
};

const generateGeoJSON = (schools, settings) => {
  let mySchools = schools;
  if (settings?.filterSchoolByRating) {
    mySchools = mySchools.filter((school) => school.eqaoRating >= 70);
  }
  if (settings?.filterSchoolByBoard) {
    mySchools = mySchools.filter((school) => school.isCatholic === false);
  }
  const features = mySchools.map((school) => {
    let boundaries = [];
    if (school?.boundaries.length > 0) {
      boundaries = school.boundaries[0].map((boundary) => [
        boundary[1],
        boundary[0],
      ]);
    }

    let baseColor = "#4361EE";
    if (school.isCatholic && school.eqaoRating >= 70) {
      baseColor = "#C71AAD";
    }
    if (school.isCatholic && school.eqaoRating < 70) {
      baseColor = "#F83A90";
    }
    if (!school.isCatholic && school.eqaoRating < 70) {
      baseColor = "#4895EF";
    }

    return {
      type: "Feature",
      properties: {
        id: school.id,
        board: school.board,
        name: school.name,
        level: school.level,
        eqaoRating: school.eqaoRating,
        fraserRating: school.fraserRating < 0 ? undefined : school.fraserRating,
        language: school.language,
        boundaries,
        catholic: school.isCatholic,
        markerImage: "custom-marker",
        markerColor: baseColor,
      },
      geometry: {
        type: "Point",
        coordinates: [school.location[1], school.location[0]],
      },
    };
  });
  return {
    type: "FeatureCollection",
    features,
  };
};

const getBBox = (coords) => {
  const radius = 0.3;
  const options = { steps: 40, units: "kilometers" };
  const circleBound = circle(coords, radius, options);
  const points = circleBound.geometry.coordinates;
  const line = linestring(points[0]);
  const bboxPoi = bbox(line);
  const bboxPolygonPoi = bboxPolygon(bboxPoi);
  return {
    bboxPoi,
    bboxPolygonPoi,
  };
};

export default Maps;
