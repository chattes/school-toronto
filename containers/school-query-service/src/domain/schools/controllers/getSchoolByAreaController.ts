import * as express from 'express';
import {
  BaseController,
  HttpRequestType
} from '../../../express-callback/baseController';
import { School } from '../school';
import { GetSchoolByArea } from '../use-cases/getSchools/byArea';
import { GetSchoolByAreaDTO } from '../use-cases/getSchools/dtos/dtoGetSchoolByArea';
import { toSchoolQueryResultDTO } from './DTOSchoolQueryResult';

export class GetSchoolByAreaController extends BaseController {
  private useCase: GetSchoolByArea;
  constructor(useCase: GetSchoolByArea) {
    super();
    this.useCase = useCase;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async executeImpl(req: HttpRequestType, res: express.Response): Promise<any> {
    const dto: GetSchoolByAreaDTO = req.body as GetSchoolByAreaDTO;
    const result = await this.useCase.execute(dto);
    const schoolResultDto = result
      .filter((school) => school.isRight())
      .map((school) => toSchoolQueryResultDTO(school.value as School));

    return this.ok(res, {
      count: schoolResultDto.length,
      schools: schoolResultDto
    });
  }
}
