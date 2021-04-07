import { isUndefined } from 'lodash';
import { AppError } from '../../../shared/AppError';
import { Either, left, right } from '../../../shared/Result';

export type SchoolLocResponse = Either<AppError, SchoolLocation>;
export class SchoolLocation {
  private lat: number;
  private lng: number;
  constructor(lat: number, lng: number) {
    this.lat = lat;
    this.lng = lng;
  }
  public get latitude(): number {
    return this.lat;
  }
  public get longitude(): number {
    return this.lng;
  }
  public static create(lat: number, lng: number): SchoolLocResponse {
    if (isUndefined(lat) || isUndefined(lng)) {
      return left(new AppError('Location is invalid'));
    }
    //TODO - Check if Location is valid
    return right(new SchoolLocation(lat, lng));
  }
}
