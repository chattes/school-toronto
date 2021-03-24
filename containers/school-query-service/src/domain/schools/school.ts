/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { SchoolLanguage } from './valueObects/SchoolLanguage';
import { SchoolLevel } from './valueObects/SchoolLevel';
import { SchoolLocation } from './valueObects/SchoolLocation';
import { isEmpty } from 'lodash';
import { AppError } from '../../shared/AppError';
import { Either, left, right } from '../../shared/Result';

export type SchoolResult = Either<AppError, School>;

export type SchoolProps = {
  schoolId: string;
  board: string;
  city: string;
  eqaoRating: number;
  fraserRating: number;
  isCatholic: boolean;
  language: SchoolLanguage;
  level: SchoolLevel;
  name: string;
  type: string;
  location: SchoolLocation;
};
export class School {
  private props: SchoolProps;

  constructor(props: SchoolProps) {
    this.props = props;
  }

  public get id() {
    return this.props.schoolId;
  }
  public get board() {
    return this.props.board;
  }
  public get city() {
    return this.props.city;
  }
  public get eqaoRating() {
    return this.props.eqaoRating;
  }
  public get fraserRating() {
    return this.props.fraserRating;
  }
  public get cathoic() {
    return !!this.props.isCatholic;
  }
  public get language() {
    return this.props.language.SchoolLanguage;
  }
  public get level() {
    return this.props.level.SchoolLevel;
  }

  public get name() {
    return this.props.name;
  }

  public get type() {
    return this.props.type;
  }

  public get location() {
    return [this.props.location.latitude, this.props.location.longitude];
  }

  public static create(school: SchoolProps): SchoolResult {
    if (!school.schoolId) {
      return left(new AppError('School Id is missing'));
    }

    if (!school.name || isEmpty(school.name)) {
      return left(new AppError('School does not have a name'));
    }

    return right(new School(school));
  }
}
