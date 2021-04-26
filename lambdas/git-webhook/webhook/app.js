// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
var AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
let response;

const pipeline = new AWS.CodePipeline({ apiVersion: "2010-03-31" });
/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
exports.lambdaHandler = async (event, context) => {
  console.log("BODY:::", JSON.parse(event.body).ref);

  const isMainBranchRegex = /\/heads\/main/g;
  const isUIPipelineReg = /^ui\/.*/g;
  const isLambdaStopEC2Reg = /^lambdas\/stop-ec2\/.*?/g;
  const isLambdaStartEC2Reg = /^lambdas\/start-ec2\/.*?/g;
  const isLambdaWebhookReg = /^lambdas\/git-webhook\/.*?/g;
  let startUIDeloyment = false;
  let deployLambdaStopEC2 = false;
  let deployLambdaStartEC2 = false;
  let deployLambdaWebhook = false;

  const body = JSON.parse(event.body);
  console.log("Received Webhook test", body);
  if (body) {
    const refs = body.ref || null;
    const modified = body.head_commit.modified || [];
    if (refs && isMainBranchRegex.test(refs)) {
      console.log(
        "Changes Pushed to Main Branch.. We will match a pipeline..."
      );
      console.log("MOD::", modified);

      for (let mod of modified) {
        if (isUIPipelineReg.test(mod)) startUIDeloyment = true;
        if (isLambdaStopEC2Reg.test(mod)) deployLambdaStopEC2 = true;
        if (isLambdaStartEC2Reg.test(mod)) deployLambdaStartEC2 = true;
        if (isLambdaWebhookReg.test(mod)) deployLambdaWebhook = true;
      }

      if (startUIDeloyment) console.log("Deploy UI");
      if (deployLambdaStopEC2) console.log("Deploy Lambda STOP EC2");
      if (deployLambdaStartEC2) console.log("Deploy Start EC2");
      if (deployLambdaWebhook) {
        console.log("Starting Pipeline for Lambda Git Webhook...");
        pipeline.startPipelineExecution("LambdaStopEC2Pipeline-clone");
      }
    }
  } else {
    console.log("No Body :(");
  }
  return {
    isBase64Encoded: false,
    statusCode: 200,
    headers: {},
    body: "",
  };
};
