import { SchoolsRepo } from '../../../../data-access/Implementation/schools-repo-dynamo';
import { RedisCache } from '../../../../data-access/Implementation/schools-repo-redis';
import { GetSchoolByArea } from './byArea';
import { GetSchoolById } from './byId';

const cache = RedisCache.getInstance();

const schoolRepo = new SchoolsRepo(cache);
const getSchoolByIdUseCase = GetSchoolById.create(schoolRepo);
const getTopSchoolByArea = GetSchoolByArea.create(schoolRepo);

export { getSchoolByIdUseCase, getTopSchoolByArea };
