import { ISchoolRepo } from '../../../../data-access/ISchoolRepo';
import { UseCases } from '../../../../shared/UseCases';
import { AREAS } from '../../daos/schools';
import { SchoolResult } from '../../school';
import { GetSchoolByAreaDTO } from './dtos/dtoGetSchoolByArea';

export class GetSchoolByArea
  implements UseCases<GetSchoolByAreaDTO, Array<SchoolResult>> {
  private repo: ISchoolRepo<SchoolResult>;
  constructor(repo: ISchoolRepo<SchoolResult>) {
    this.repo = repo;
  }
  async execute(request: GetSchoolByAreaDTO): Promise<Array<SchoolResult>> {
    const result = await this.repo.findSchoolsByArea({
      area: request.area,
      rating: request.rating || 0
    });
    return result as Array<SchoolResult>;
  }

  public static create(repo: ISchoolRepo<SchoolResult>): GetSchoolByArea {
    return new GetSchoolByArea(repo);
  }
}
