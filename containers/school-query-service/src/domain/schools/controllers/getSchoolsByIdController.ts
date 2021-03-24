import * as express from 'express';
import {
  BaseController,
  HttpRequestType
} from '../../../express-callback/baseController';
import { School } from '../school';
import { GetSchoolById } from '../use-cases/getSchools/byId';
import { GetSchoolByIdDTO } from '../use-cases/getSchools/dtos/dtoGetSchoolsById';
import { toSchoolQueryResultDTO } from './DTOSchoolQueryResult';

export class GetSchoolByIdController extends BaseController {
  private useCase: GetSchoolById;
  constructor(useCase: GetSchoolById) {
    super();
    this.useCase = useCase;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async executeImpl(req: HttpRequestType, res: express.Response): Promise<any> {
    const dto: GetSchoolByIdDTO = req.params as GetSchoolByIdDTO;
    const result = await this.useCase.execute(dto);
    if (result.isLeft()) {
      return this.fail(res, result.value.message);
    }
    const schoolResultDto = toSchoolQueryResultDTO(result.value as School);

    return this.ok(res, schoolResultDto);
  }
}
