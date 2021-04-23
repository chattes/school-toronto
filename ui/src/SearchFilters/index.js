import React, { useState, useEffect, useContext } from "react";
import { Modal, Button } from "react-bootstrap";
import { SchoolSettings } from "../Context/Settings";
import "./searchFilters.css";
const SearchFilter = ({ showFilter, handleCloseFilter }) => {
  const { schoolSettings, setSchoolSettings } = useContext(SchoolSettings);
  const [filterSchoolByRating, setFilterSchoolByRating] = useState(
    schoolSettings.filterSchoolByRating
  );
  const [filterSchoolByBoard, setFilterSchoolByBoard] = useState(
    schoolSettings.filterSchoolByBoard
  );
  const [minBedRoom, setminBedRoom] = useState(schoolSettings.minBedRoom);
  const handleSaveSettings = () => {
    const settingsToSave = {
      filterSchoolByRating,
      filterSchoolByBoard,
      minBedRoom,
    };
    setSchoolSettings(settingsToSave);
    window.localStorage.setItem(
      "schoolSettings",
      JSON.stringify(settingsToSave)
    );
    handleCloseFilter();
  };
  return (
    <Modal show={showFilter} onHide={handleCloseFilter} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>My Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <>
          <div className="container">
            <div className="row">
              <div class="col-xs-12 col-sm-10 col-md-7 col-lg-6">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    name="gt70"
                    id="gt70"
                    value={!!filterSchoolByRating}
                    checked={!!filterSchoolByRating}
                    onChange={() => {
                      setFilterSchoolByRating(!filterSchoolByRating);
                    }}
                  />
                  <label className="form-check-label" for="gt70">
                    Show schools with rating more then 70
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="publiconly"
                    id="publiconly"
                    value={!!filterSchoolByBoard}
                    checked={!!filterSchoolByBoard}
                    onChange={() =>
                      setFilterSchoolByBoard(!filterSchoolByBoard)
                    }
                  />
                  <label className="form-check-label" for="publiconly">
                    Show Public Schools only
                  </label>
                </div>

                <div class="form-group">
                  <label for="formGroupExampleInput">
                    Minimum Bed Rooms(Listing Search)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    class="form-control"
                    id="formGroupExampleInput"
                    placeholder="Number of Bedrooms"
                    value={minBedRoom}
                    onChange={(e) => {
                      e.preventDefault();
                      setminBedRoom(e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleSaveSettings}>Save Settings</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SearchFilter;
