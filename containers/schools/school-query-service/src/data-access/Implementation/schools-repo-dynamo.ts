import { ICache, ISchoolRepo } from '../ISchoolRepo';
import { left } from '../../shared/Result';
import AWS from 'aws-sdk';
import { AppError } from '../../shared/AppError';
import { areaDao, locationDao } from '../../domain/schools/daos/schools';
import { SchoolMapper } from '../../domain/schools/mapper';
import { SchoolResult } from '../../domain/schools/school';
import { RedisCache } from './schools-repo-redis';
import { readFileSync } from 'fs';
import { GeoDataManager, GeoDataManagerConfiguration } from 'dynamodb-geo';
import { unmarshall } from '@aws-sdk/util-dynamodb';
const keyPath = process.env.AWS_ACCESS_KEY as string;
const AWS_ACCESS = readFileSync(keyPath, {
  encoding: 'utf-8'
}).replace(/^\s+|\s+$/g, '');
const secretPath = process.env.AWS_SECRET as string;
const AWS_SECRET = readFileSync(secretPath, { encoding: 'utf-8' }).replace(
  /^\s+|\s+$/g,
  ''
);
const awsConfig = {
  accessKeyId: AWS_ACCESS,
  secretAccessKey: AWS_SECRET,
  region: 'us-east-2'
};
console.log(awsConfig);
AWS.config.update(awsConfig);

const ddBatch = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
const ddb = new AWS.DynamoDB.DocumentClient();
const geoConfig = new GeoDataManagerConfiguration(ddBatch, 'schoolsgeo');
geoConfig.hashKeyLength = 6;
const schoolsGeoTableManager = new GeoDataManager(geoConfig);

export class SchoolsRepo implements ISchoolRepo<SchoolResult> {
  private redisCache: ICache;
  constructor(cache: ICache) {
    this.redisCache = cache;
  }
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

    let schoolRawCollection: Array<any> = [];
    const cacheKey = RedisCache.generateHashKey(JSON.stringify(query));
    schoolRawCollection = await this.redisCache.get(cacheKey);

    if (!schoolRawCollection) {
      const response = await ddb.query(query).promise();
      schoolRawCollection = response.Items ? response.Items : [];
      await this.redisCache.set(cacheKey, schoolRawCollection);
    }

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
  async findSchoolsByLocation(
    location: locationDao
  ): Promise<SchoolResult[] | SchoolResult> {
    const { filters = null } = location;
    if (!filters) {
      console.log('No filters specified querying all data...');
    }
    const response = await schoolsGeoTableManager.queryRadius({
      RadiusInMeter: location.radiusInMeters,
      CenterPoint: location.centerPoint
    });
    console.log(response);
    const results = response.map((school) => unmarshall(school));

    let schoolDomainCollection = results.map((schoolRaw) =>
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
}
