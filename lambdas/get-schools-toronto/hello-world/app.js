const axios = require("axios");
const aws = require("aws-sdk");
const url = "https://www.scholarhood.ca/schools.json";
let response;

aws.config.update({ region: "us-east-2" });
const ddb = new aws.DynamoDB({ apiVersion: "2012-08-10" });

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
exports.lambdaHandler = async (event, context) => {
  try {
    const schoolsTdsb = axios({
      url,
      method: "get",
      params: {
        region: "tdsb",
      },
      timeout: 5000,
    });
    const schoolsTcdsb = axios({
      url,
      method: "get",
      params: {
        region: "tcdsb",
      },
      timeout: 5000,
    });

    const allSchools = await Promise.all([schoolsTdsb, schoolsTcdsb]);
    const torontoSchools = allSchools
      .reduce((acc, school) => {
        const schoolData = school.data;
        return [...acc, ...schoolData];
      }, [])
      .map((school) => {
        return (({
          url,
          id,
          name,
          type,
          is_catholic,
          language,
          level,
          city,
          city_slug,
          board,
          fraser_rating,
          eqao_rating,
        }) => ({
          url,
          "school-id": id,
          name,
          type,
          is_catholic,
          language,
          level,
          city,
          city_slug,
          board,
          fraser_rating,
          "eqao-rating": eqao_rating,
          record_last_processed: Date.now()
        }))(school);
      });

    console.log("ALL:", torontoSchools.length);
    console.log(
      "Public",
      torontoSchools.filter((s) => s.is_catholic === false).length
    );
    console.log(
      "Top::",
      torontoSchools.filter((s) => s.eqao_rating > 80).length
    );
    await saveData(torontoSchools);
  } catch (err) {
    console.log(err);
    return err;
  }

  return response;
};

const saveData = async (data) => {
  try {
    const mappedObject = data.map((school) => {
      let o = {};
      for (const [key, val] of Object.entries(school)) {
        if (key === "school-id") {
          o[key] = { S: val.toString() };
          continue;
        }
        if (key === "eqao-rating") {
          o[key] = { N: val.toString() };
          continue;
        }
        if (key === "fraser_rating") {
          o[key] = { N: val.toString() };
          continue;
        }
        if (key === "is_catholic") {
          o[key] = { BOOL: val };
          continue;
        }
        if(key === "record_last_processed"){
            o[key] = { N: val.toString() }
        }
        o[key] = { S: val.toString() };
      }
      return o;
    });
    const inputRequest = mappedObject.map((school) => {
      return {
        PutRequest: {
          Item: {
            ...school,
          },
        },
      };
    });

    const batchRequests = batch(0, 5, inputRequest, []);

    let writePromise = [];
    for (const requests of batchRequests) {
      const params = {
        RequestItems: {
          "schools-toronto": [...requests],
        },
      };

      console.log("Writing batch items");

      writePromise.push(ddb.batchWriteItem(params).promise());
    }
    const writeResults = await Promise.all(writePromise);
    console.log(writeResults);
    return;
  } catch (error) {
    console.log("Error writing data", error);
  }
};

const batch = (start, end, arr, res) => {
  if (end > arr.length) {
    res.push(arr.slice(start));
    return res;
  }

  res.push(arr.slice(start, end));
  let diff = end - start;
  return batch(end, end + diff, arr, res);
};
