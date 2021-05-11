// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;
const AWS = require("aws-sdk");

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
  console.log("Start Instance");
  try {
    const instances = [
      "i-00ab52aecf16acd07",
      "i-04b6aaff29d98da62",
      "i-080c7f741e80a90c1",
      "i-0dbac55092898cde9",
    ];

    const ec2 = new AWS.EC2({ region: "us-east-2" });
    await ec2.startInstances({ InstanceIds: instances }).promise();
  } catch (error) {
    console.log("Cannot Stop instances", error);
    return;
  }
  return `Instances Stopped Succesfully`;
};
