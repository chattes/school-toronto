import { ISchoolRepo } from '../../../../data-access/ISchoolRepo';
import { UseCases } from '../../../../shared/UseCases';
import { locationDao } from '../../daos/schools';
import { SchoolResult } from '../../school';
import { GetSchoolByCoordsDTO } from './dtos/dtoGetSchoolByCoordsDTO';

export class GetSchoolByCoords
  implements UseCases<GetSchoolByCoordsDTO, Array<SchoolResult>> {
  private repo: ISchoolRepo<SchoolResult>;
  constructor(repo: ISchoolRepo<SchoolResult>) {
    this.repo = repo;
  }
  async execute(request: GetSchoolByCoordsDTO): Promise<Array<SchoolResult>> {
    const locationData: locationDao = {
      centerPoint: {
        latitude: request.coords.latitude,
        longitude: request.coords.longitude
      },
      radiusInMeters: request.radiusInMeters,
      filters: request.filters
    };
    const result = await this.repo.findSchoolsByLocation(locationData);
    return result as Array<SchoolResult>;
  }

  public static create(repo: ISchoolRepo<SchoolResult>): GetSchoolByCoords {
    return new GetSchoolByCoords(repo);
  }
}
