export type GetSchoolByCoordsDTO = {
  coords: {
    latitude: number;
    longitude: number;
  };
  radiusInMeters: number;
  filters: {
    minRating: number;
    onlyPublic: boolean;
  };
};
