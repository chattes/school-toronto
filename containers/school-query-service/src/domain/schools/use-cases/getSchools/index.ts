import { SchoolsRepo } from '../../../../data-access/Implementation/schools-repo-dynamo';
import { GetSchoolByArea } from './byArea';
import { GetSchoolById } from './byId';

const schoolRepo = new SchoolsRepo();
const getSchoolByIdUseCase = GetSchoolById.create(schoolRepo);
const getTopSchoolByArea = GetSchoolByArea.create(schoolRepo);

export { getSchoolByIdUseCase, getTopSchoolByArea };
