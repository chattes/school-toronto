import { useEffect, createContext, useState } from "react";
export const SchoolSettings = createContext();
const SchoolSettingsProvider = ({ children }) => {
  const [schoolSettings, setSchoolSettings] = useState({
    filterSchoolByRating: false,
    filterSchoolByBoard: false,
    minBedRoom: 1,
  });

  useState(() => {
    const schoolSettings = window.localStorage.getItem("schoolSettings");
    if (schoolSettings) {
      setSchoolSettings(JSON.parse(schoolSettings));
    }
  }, []);

  return (
    <SchoolSettings.Provider value={{ schoolSettings, setSchoolSettings }}>
      {children}
    </SchoolSettings.Provider>
  );
};

export default SchoolSettingsProvider;
