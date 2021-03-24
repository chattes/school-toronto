import { left } from '../../shared/Result';
import { SchoolResult, School } from './school';
import { SchoolLanguage } from './valueObects/SchoolLanguage';
import { SchoolLevel } from './valueObects/SchoolLevel';
import { SchoolLocation } from './valueObects/SchoolLocation';

export class SchoolMapper {
  static toDomain(raw: any): SchoolResult {
    const schoolLangauge = new SchoolLanguage(raw['language']);
    const schoolLevel = new SchoolLevel(raw['level']);
    const location = SchoolLocation.create(
      raw.location_data.latitude,
      raw.location_data.longitude
    );
    if (location.isLeft()) return left(location.value);
    return School.create({
      name: raw['name'],
      board: raw['board'],
      city: raw['city'],
      eqaoRating: raw['eqao-rating'],
      fraserRating: raw['fraser-rating'],
      isCatholic: raw['is_catholic'],
      language: schoolLangauge,
      level: schoolLevel,
      location: location.value,
      schoolId: raw['school-id'],
      type: raw['type']
    });
  }
}
