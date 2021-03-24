export type locationDao = {
  latitude: number;
  longitude: number;
};

export enum AREAS {
  NORTH_YORK = 'toronto-north-york',
  EAST_YORK = 'toronto-east-york',
  CENTRAL = 'toronto-central',
  ETOBICOKE = 'toronto-etobicoke',
  SCARBOROUGH = 'toronto-scarborough',
  YORK = 'toronto-york'
}

export type areaDao = {
  area: string;
  rating: number;
};

export type schoolDao = {
  id: string;
  eqaoRating: number;
  board: string;
  city: string;
  fraserRating: number;
  isCatholic: boolean;
  language: string;
  level: string;
  name: string;
  type: string;
  location: locationDao;
  boundary?: Array<locationDao>;
};
