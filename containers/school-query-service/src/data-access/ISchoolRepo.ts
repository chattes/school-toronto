import { areaDao, locationDao } from '../domain/schools/daos/schools';

export interface ISchoolRepo<T> {
  findSchoolById(id: string): Promise<T>;
  findSchoolsByLocation(location: locationDao): Promise<T[] | T>;
  findSchoolsByArea(area: areaDao): Promise<T[] | T>;
}
