import { School } from './school';
import { SchoolLanguage } from './valueObects/SchoolLanguage';
import { SchoolLevel } from './valueObects/SchoolLevel';
import { SchoolLocation } from './valueObects/SchoolLocation';

const schoolProp = {
  schoolId: '33',
  board: 'tdsb',
  city: 'toronto',
  eqaoRating: 88,
  fraserRating: 88,
  isCatholic: false,
  language: new SchoolLanguage('english'),
  level: new SchoolLevel('elementary'),
  name: 'Test School',
  type: 'public',
  location: new SchoolLocation(54, 75)
};

let schoolPropForTest;

describe('testing school domain', () => {
  beforeEach(() => (schoolPropForTest = { ...schoolProp }));

  it('domain needs an id', () => {
    const raw = schoolPropForTest;
    delete raw.schoolId;
    expect(School.create(raw).isLeft()).toBe(true);
  });
  it('should have a school name', () => {
    const raw = schoolPropForTest;
    delete raw.name;
    expect(School.create(raw).isLeft()).toBe(true);
  });
  it('should create a school object', () => {
    const raw = schoolPropForTest;
    const school = School.create(raw).value as School;
    expect(school.board).not.toBeUndefined();
    expect(school.location.length).toBe(2);
    expect(school.level).toBe('elementary');
  });
});
