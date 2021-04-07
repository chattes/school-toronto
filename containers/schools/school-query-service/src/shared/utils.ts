import { isEmpty, isNull, isUndefined } from 'lodash';

export const checkEmptyOrUndefined = (x): boolean =>
  isEmpty(x) || isNull(x) || isUndefined(x);
