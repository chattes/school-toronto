import * as dotenv from 'dotenv';
import AWS from 'aws-sdk';
import { marshall, marshallOptions } from '@aws-sdk/util-dynamodb';
import { uuid } from 'uuidv4';
import {
  GeoDataManager,
  GeoDataManagerConfiguration,
  GeoTableUtil
} from 'dynamodb-geo';
import { PutPointInput } from 'dynamodb-geo/dist/types';
import {
  CreateTableInput,
  DescribeTableInput,
  DescribeTableOutput
} from 'aws-sdk/clients/dynamodb';
dotenv.config();

//Keys

type SchoolDomain = {
  schoolId: string;
  eqaoRating: string;
  fraserRating: string;
  board: string;
  city: string;
  citySlug: string;
  catholic: boolean;
  language: string;
  level: string;
  location: { latitude: number; longitude: number };
  name: string;
  type: string;
  url: string;
  boundaries: Array<Array<number>>;
};

const AWS_ACCESS = process.env.AWS_ACCESS_KEY;
const AWS_SECRET = process.env.AWS_SECRET;
const awsConfig = {
  accessKeyId: AWS_ACCESS,
  secretAccessKey: AWS_SECRET,
  region: 'us-east-2'
};
AWS.config.update(awsConfig);
const ddb = new AWS.DynamoDB.DocumentClient();
const ddBatch = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

const geoConfig = new GeoDataManagerConfiguration(ddBatch, 'schoolsgeo');
geoConfig.longitudeFirst = true;
const schoolGeoDataManager = new GeoDataManager(geoConfig);
const sleep = (delay: number) => {
  return new Promise((res) => setTimeout(res, delay));
};
const waitForTableActive = async (tableName: string) => {
  const decribeTableInput: DescribeTableInput = {
    TableName: tableName
  };
  try {
    const describeTableResult: DescribeTableOutput = await ddBatch
      .describeTable(decribeTableInput)
      .promise();
    console.log(describeTableResult);
    if (
      describeTableResult.Table &&
      describeTableResult.Table.TableStatus &&
      describeTableResult.Table.TableStatus === 'ACTIVE'
    ) {
      console.log('Table is active .. wait for sometime and return...');
      await sleep(3000);
      return true;
    }
    await sleep(2000);
    await waitForTableActive(tableName);
  } catch (error) {
    if (error.code === 'ResourceNotFoundException') {
      await sleep(2000);
      await waitForTableActive(tableName);
    }

    throw error;
  }
};

const createSchoolQueryTable = async () => {
  const createQueryTableInput: CreateTableInput = {
    TableName: 'schools-query',
    AttributeDefinitions: [
      {
        AttributeName: 'PK',
        AttributeType: 'S'
      },
      {
        AttributeName: 'SK',
        AttributeType: 'S'
      },
      {
        AttributeName: 'GSIPK',
        AttributeType: 'S'
      },
      {
        AttributeName: 'GSISK',
        AttributeType: 'S'
      }
    ],
    KeySchema: [
      { AttributeName: 'PK', KeyType: 'HASH' }, //Partition key
      { AttributeName: 'SK', KeyType: 'RANGE' } //Sort key
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    },
    GlobalSecondaryIndexes: [
      {
        IndexName: 'GSI' /* required */,
        KeySchema: [
          {
            AttributeName: 'GSIPK' /* required */,
            KeyType: 'HASH' /* required */
          },
          {
            AttributeName: 'GSISK' /* required */,
            KeyType: 'RANGE' /* required */
          }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5 /* required */,
          WriteCapacityUnits: 5 /* required */
        }
      }
      /* more items */
    ]
  };
  return ddBatch
    .createTable(createQueryTableInput)
    .promise()
    .then(() => {
      ddBatch.waitFor('tableExists', { TableName: 'schools-query' }).promise();
    })
    .then(() => console.log('Schools Query table Created'))
    .catch((err) => {
      if (err.code === 'ResourceInUseException')
        return console.log('Query table already exists');
      throw err;
    });
};
const createSchoolsGeoTable = async () => {
  geoConfig.hashKeyLength = 6;
  const createTableInput = GeoTableUtil.getCreateTableRequest(geoConfig);
  if (createTableInput.ProvisionedThroughput) {
    createTableInput.ProvisionedThroughput.ReadCapacityUnits = 2;
  }
  return ddBatch
    .createTable(createTableInput)
    .promise()
    .then(() =>
      ddBatch
        .waitFor('tableExists', { TableName: geoConfig.tableName })
        .promise()
    )
    .then(() => {
      console.log('Geo table created');
      return;
    })
    .catch((err) => {
      if (err.code === 'ResourceInUseException')
        return console.log('Table already exists');
      throw err;
    });
};
const fillGeoData = async (data: Array<SchoolDomain>) => {
  const putPointInputs: PutPointInput[] = data.map((school) => {
    return {
      RangeKeyValue: {
        S: `${school.eqaoRating}#${school.schoolId}#${school.level}#${school.language}`
      },
      GeoPoint: {
        latitude: school.location.latitude,
        longitude: school.location.longitude
      },
      PutItemInput: {
        Item: marshall({
          'school-id': school.schoolId,
          name: school.name,
          'eqao-rating': school.eqaoRating.toString(),
          fraser_rating: school.fraserRating,
          board: school.board,
          language: school.language,
          city: school.city,
          slug: school.citySlug,
          type: school.type,
          boundaries: school.boundaries,
          url: school.url,
          location_data: school.location,
          level: school.level
        })
      }
    };
  });

  const BATCH_SIZE = 25;
  const WAIT_BETWEEN_BATCHES_MS = 1000;

  let currentBatch = 1;

  async function resumeWriting(): Promise<any> {
    if (putPointInputs.length === 0) return Promise.resolve();
    const thisBatch: typeof putPointInputs = [];
    for (
      let i = 0, itemToAdd = null;
      i < BATCH_SIZE && (itemToAdd = putPointInputs.shift());
      i++
    ) {
      thisBatch.push(itemToAdd);
    }
    console.log(
      'Writing batch ' +
        currentBatch++ +
        '/' +
        Math.ceil(data.length / BATCH_SIZE)
    );

    return schoolGeoDataManager
      .batchWritePoints(thisBatch)
      .promise()
      .then(function () {
        return new Promise(function (resolve) {
          setInterval(resolve, WAIT_BETWEEN_BATCHES_MS);
        });
      })
      .then(async function () {
        return await resumeWriting();
      });
  }
  return await resumeWriting().catch(async function (error) {
    if (error.code === 'ProvisionedThroughputExceededExceptio') {
      console.log('Eh! wait a minute');
      await sleep(20000);
      return await resumeWriting();
    }
    console.warn(error);
  });
};
const scanDocuments = async (
  query: any,
  items: Array<any>
): Promise<Array<any>> => {
  const tResult = await ddb.scan(query).promise();
  const tResultCurrentBatch = tResult.Items || [];

  items = [...items, ...tResultCurrentBatch];

  if (tResult.LastEvaluatedKey === undefined) {
    return items;
  } else {
    query.ExclusiveStartKey = tResult.LastEvaluatedKey;
    return await scanDocuments(query, items);
  }
};

const putItemsByRegion = async (items: Array<SchoolDomain>): Promise<any> => {
  const schools = items;
  const raw_items = schools.map((school: SchoolDomain) => ({
    PK: school.citySlug.toLowerCase(),
    SK: `${school.eqaoRating
      .toString()
      .trim()}#${school.level.trim()}#${school.schoolId.trim()}`,
    GSIPK: school.board.toLowerCase(),
    GSISK: school.language.toLowerCase(),
    'school-id': school.schoolId,
    name: school.name,
    board: school.board,
    'eqao-rating': school.eqaoRating,
    fraser_rating: school.fraserRating,
    city: school.city,
    slug: school.citySlug,
    type: school.type,
    location_data: school.location,
    level: school.level,
    language: school.language,
    boundaries: school.boundaries || []
  }));

  let dItems = raw_items.map((item: any) => marshall(item));
  dItems = dItems.map((item: any) => ({
    PutRequest: {
      Item: item
    }
  }));

  const BATCH_SIZE = 25;
  const WAIT_BETWEEN_BATCHES_MS = 15000;

  let currentBatch = 1;

  async function resumeWriting(): Promise<any> {
    if (dItems.length === 0) return Promise.resolve();
    const thisBatch: typeof dItems = [];
    for (
      let i = 0, itemToAdd = null;
      i < BATCH_SIZE && (itemToAdd = dItems.shift());
      i++
    ) {
      thisBatch.push(itemToAdd);
    }
    console.log(
      'Writing batch ' +
        currentBatch++ +
        '/' +
        Math.ceil(items.length / BATCH_SIZE)
    );
    const params = {
      RequestItems: {
        'schools-query': thisBatch
      }
    };
    return ddBatch
      .batchWriteItem(params)
      .promise()
      .then(function () {
        return new Promise(function (resolve) {
          setInterval(resolve, WAIT_BETWEEN_BATCHES_MS);
        });
      })
      .then(async function () {
        return await resumeWriting();
      });
  }
  return await resumeWriting().catch(async function (error) {
    if (error.code === 'ProvisionedThroughputExceededExceptio') {
      console.log('Eh! wait a minute');
      sleep(20000);

      return await resumeWriting();
    }
    console.warn(error);
  });
};

const toDomain = (itemsRaw: Array<any>): Array<SchoolDomain> => {
  const schoolItems = itemsRaw.map((item) => {
    const schoolByLevel = item.level.split(',').map((level: string) => {
      const school: SchoolDomain = {
        schoolId: item['school-id'],
        eqaoRating: item['eqao-rating'].toString(),
        board: item.board.toLowerCase(),
        city: item.city.toLowerCase(),
        citySlug: item.city_slug.toLowerCase(),
        fraserRating: item.fraser_rating,
        catholic: item.is_catholic,
        language: item.language.toLowerCase(),
        level: level.toLowerCase(),
        name: item.name,
        type: item.type.toLowerCase(),
        url: item.url.toLowerCase(),
        location: {
          latitude: item.location_data.latitude,
          longitude: item.location_data.longitude
        },
        boundaries: item.location_data.boundaries[level.trim()] || []
      };
      return school;
    });
    return schoolByLevel;
  });
  return schoolItems.flat();
};

const start = async () => {
  try {
    const query = {
      TableName: 'schools-toronto',
      FilterExpression: 'attribute_exists(location_data)'
    };
    const allItems = await scanDocuments(query, []);
    // console.log(allItems);

    const schools = toDomain(allItems);

    await createSchoolsGeoTable();
    await waitForTableActive('schoolsgeo');
    await fillGeoData(schools);
    console.log('Done writing geo entries');
    console.log('Wait a minute');
    await sleep(60000);
    await createSchoolQueryTable();
    await waitForTableActive('schools-query');
    await putItemsByRegion(schools);
    console.log('Done writing query entries');
    process.exit(0);
    // await putItemsByRatings(allItems);
  } catch (error) {
    console.log('An error occured', error);
  }
};

start();
