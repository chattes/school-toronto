import { areaDao, locationDao } from '../domain/schools/daos/schools';

export interface ISchoolRepo<T> {
  findSchoolById(id: string): Promise<T>;
  findSchoolsByLocation(location: locationDao): Promise<T[] | T>;
  findSchoolsByArea(area: areaDao): Promise<T[] | T>;
}

export interface ICache {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<any>;
  delete(key: string): Promise<any>;
}
