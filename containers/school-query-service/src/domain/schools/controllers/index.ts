import {
  getSchoolByIdUseCase,
  getTopSchoolByArea
} from '../use-cases/getSchools';
import { GetSchoolByAreaController } from './getSchoolByAreaController';
import { GetSchoolByIdController } from './getSchoolsByIdController';

const getSchoolByIdController = new GetSchoolByIdController(
  getSchoolByIdUseCase
);
const getSchoolsByAreaController = new GetSchoolByAreaController(
  getTopSchoolByArea
);

export { getSchoolByIdController, getSchoolsByAreaController };
