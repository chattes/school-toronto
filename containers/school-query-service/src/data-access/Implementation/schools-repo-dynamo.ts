import { ISchoolRepo } from '../ISchoolRepo';
import { left } from '../../shared/Result';
import AWS from 'aws-sdk';
import { AppError } from '../../shared/AppError';
import { areaDao, locationDao } from '../../domain/schools/daos/schools';
import { SchoolMapper } from '../../domain/schools/mapper';
import { SchoolResult } from '../../domain/schools/school';
import { promisify } from 'util';

const AWS_ACCESS = process.env.AWS_ACCESS_KEY;
const AWS_SECRET = process.env.AWS_SECRET;
const awsConfig = {
  accessKeyId: AWS_ACCESS,
  secretAccessKey: AWS_SECRET,
  region: 'us-east-2'
};
AWS.config.update(awsConfig);
const ddb = new AWS.DynamoDB.DocumentClient();

export class SchoolsRepo implements ISchoolRepo<SchoolResult> {
  async findSchoolsByArea(
    area: areaDao
  ): Promise<SchoolResult[] | SchoolResult> {
    if (!area) {
      return left(new AppError('Area is required'));
    }
    const query = {
      TableName: 'schools-query',
      KeyConditionExpression: '#pk = :area_name AND #sk > :rating',
      ExpressionAttributeNames: {
        '#pk': 'PK',
        '#sk': 'SK'
      },
      ExpressionAttributeValues: {
        ':area_name': area.area,
        ':rating': area.rating.toString()
      }
    };

    const response = await ddb.query(query).promise();
    const schoolRawCollection = response.Items ? response.Items : [];
    let schoolDomainCollection = schoolRawCollection.map((schoolRaw) =>
      SchoolMapper.toDomain(schoolRaw)
    );
    schoolDomainCollection = schoolDomainCollection.filter((domain) => {
      if (domain.isLeft()) {
        console.error(
          `Removing school from collection as it has errors ${domain.value}`
        );
        return false;
      }
      return true;
    });

    return schoolDomainCollection;
  }
  async findSchoolById(id: string): Promise<SchoolResult> {
    try {
      if (!id) {
        return left(new AppError('School Id is required'));
      }
      const query = {
        TableName: 'schools-toronto',
        KeyConditionExpression: '#id = :id',
        ExpressionAttributeNames: {
          '#id': 'school-id'
        },
        ExpressionAttributeValues: {
          ':id': id
        }
      };

      const response = await ddb.query(query).promise();
      const schoolRaw = response.Items ? response.Items[0] : null;
      return SchoolMapper.toDomain(schoolRaw);
    } catch (error) {
      return left(error) as SchoolResult;
    }
  }
  async findSchoolsByLocation(location: locationDao): Promise<SchoolResult> {
    throw new Error('Method not implemented.');
  }
}
