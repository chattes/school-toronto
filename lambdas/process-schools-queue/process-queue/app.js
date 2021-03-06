const aws = require("aws-sdk");
aws.config.update({ region: "us-east-2" });
let response;
const sqs = new aws.SQS({ apiVersion: "2012-11-05" });
const ddb = new aws.DynamoDB.DocumentClient();

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
const scanDocuments = async (query) => {
  const tResult = await ddb.scan(query).promise();
  const tResultCurrentBatch = tResult.Items.slice(0, 10);
  console.log(tResultCurrentBatch);

  if (tResultCurrentBatch.length === 0) {
    console.log("Last KEY::", tResult.LastEvaluatedKey);
    if (typeof tResult.LastEvaluatedKey != "undefined") {
      console.log("Scanning Again for Data");
      query.ExclusiveStartKey = tResult.LastEvaluatedKey;
      await scanDocuments(query);
      return;
    } else {
      return;
    }
  } else {
    const updPromise = [];
    const currentDateString = new Date().getTime().toString();
    for (const qres of tResultCurrentBatch) {
      let schoolId = `${qres["school-id"]}`;
      let rating = qres["eqao-rating"];
      const update = {
        TableName: "schools-toronto",
        Key: {
          "school-id": schoolId,
          "eqao-rating": rating,
        },
        UpdateExpression: "set #recordDate = :datenow",
        ExpressionAttributeNames: {
          "#recordDate": "record_last_processed",
        },
        ExpressionAttributeValues: {
          ":datenow": currentDateString,
        },
      };

      updPromise.push(ddb.update(update).promise());
      // Process DynamoDB entries and send to message queue
      var params = {
        // Remove DelaySeconds parameter and value for FIFO queues
        DelaySeconds: (Math.floor(Math.random() * 14) + 1) * 60,
        MessageBody: JSON.stringify({
          id: qres["school-id"],
          url: qres["url"],
          name: qres["name"],
          rating: qres["eqao-rating"],
        }),
        QueueUrl:
          "https://sqs.us-east-2.amazonaws.com/241056173073/school-info",
      };

      await sqs.sendMessage(params).promise();
      await Promise.all(updPromise);
      return;
    }
  }
};
exports.lambdaHandler = async (event, context) => {
  try {
    let dateBefore = new Date().getTime() - 60000 * 60 * 24 * 4;
    console.log(dateBefore);
    const query = {
      TableName: "schools-toronto",
      ProjectionExpression: "#id,#rating, #school_url, #school_name, #record",
      FilterExpression: "record_last_processed < :dateBefore",
      ExpressionAttributeNames: {
        "#record": "record_last_processed",
        "#id": "school-id",
        "#rating": "eqao-rating",
        "#school_url": "url",
        "#school_name": "name",
      },
      ExpressionAttributeValues: {
        ":dateBefore": dateBefore.toString(),
      },
    };
    await scanDocuments(query)
    return
  } catch (err) {
    console.log("Error occcured during Update Operation", err);
    return err;
  }
};
