import { School } from '../school';

export const toSchoolQueryResultDTO = (school: School): any => ({
  id: school.id,
  board: school.board,
  isCatholic: school.cathoic,
  name: school.name,
  language: school.language,
  location: school.location,
  level: school.level,
  eqaoRating: school.eqaoRating,
  fraserRating: school.fraserRating
});
