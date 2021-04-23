import {
  getSchoolByCoordinates,
  getSchoolByIdUseCase,
  getTopSchoolByArea
} from '../use-cases/getSchools';
import { GetSchoolByAreaController } from './getSchoolByAreaController';
import { GetSchoolByCoordsController } from './getSchoolByCoordsController';
import { GetSchoolByIdController } from './getSchoolsByIdController';

const getSchoolByIdController = new GetSchoolByIdController(
  getSchoolByIdUseCase
);
const getSchoolsByAreaController = new GetSchoolByAreaController(
  getTopSchoolByArea
);
const getSchoolsByCoordinatesController = new GetSchoolByCoordsController(
  getSchoolByCoordinates
);

export {
  getSchoolByIdController,
  getSchoolsByAreaController,
  getSchoolsByCoordinatesController
};
