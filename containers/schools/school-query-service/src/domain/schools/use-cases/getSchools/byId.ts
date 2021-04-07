import { ISchoolRepo } from '../../../../data-access/ISchoolRepo';
import { UseCases } from '../../../../shared/UseCases';
import { GetSchoolByIdDTO } from './dtos/dtoGetSchoolsById';
import { SchoolResult } from '../../school';

export class GetSchoolById implements UseCases<GetSchoolByIdDTO, SchoolResult> {
  private repo: ISchoolRepo<SchoolResult>;
  constructor(repo: ISchoolRepo<SchoolResult>) {
    this.repo = repo;
  }
  async execute(request: GetSchoolByIdDTO): Promise<SchoolResult> {
    const result = await this.repo.findSchoolById(request.schoolid);
    return result as SchoolResult;
  }

  public static create(repo: ISchoolRepo<SchoolResult>): GetSchoolById {
    return new GetSchoolById(repo);
  }
}
