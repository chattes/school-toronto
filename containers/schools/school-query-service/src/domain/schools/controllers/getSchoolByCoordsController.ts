import * as express from 'express';
import {
  BaseController,
  HttpRequestType
} from '../../../express-callback/baseController';
import { School } from '../school';
import { GetSchoolByCoords } from '../use-cases/getSchools/byCoords';
import { GetSchoolByCoordsDTO } from '../use-cases/getSchools/dtos/dtoGetSchoolByCoordsDTO';
import { toSchoolQueryResultDTO } from './DTOSchoolQueryResult';

export class GetSchoolByCoordsController extends BaseController {
  private useCase: GetSchoolByCoords;
  constructor(useCase: GetSchoolByCoords) {
    super();
    this.useCase = useCase;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async executeImpl(req: HttpRequestType, res: express.Response): Promise<any> {
    const dto: GetSchoolByCoordsDTO = req.body as GetSchoolByCoordsDTO;
    if (!dto.coords || !dto.radiusInMeters) {
      return this.clientError(res, 'Mandatory parameters missing');
    }

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
