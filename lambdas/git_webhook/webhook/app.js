// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
var AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
let response;

const pipeline = new AWS.CodePipeline({ apiVersion: "2015-07-09" });
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
  let startUIDeloyment = false;
  let deployLambdaStopEC2 = false;
  let deployLambdaStartEC2 = false;
  let deployLambdaWebhook = false;

  const body = JSON.parse(event.body);
  console.log("Received Webhook Tst - Should BE DEPLOYED", body);
  if (body) {
    const refs = body.ref || null;
    const commits = body.commits;
    const mods = commits.map((commit) => commit.modified).flat();
    console.log("All Mods::", mods);
    if (refs && isMainBranchRegex.test(refs)) {
      console.log(
        "Changes Pushed to Main Branch.. We will match a pipeline..."
      );

      const lambdaPipeLinesPromises = mods
        .filter((mod) => {
          const lambdaCapture =
            /(?<top>^lambdas)\/(?<lname>.*?)\/(?<rest>.*)$/gm;
          return lambdaCapture.exec(mod) !== null;
        })
        .map((mod) => {
          const lambdaCapture =
            /(?<top>^lambdas)\/(?<lname>.*?)\/(?<rest>.*)$/gm;
          console.log(`Mod Pipline ...`, mod);
          const lambdaName = lambdaCapture.exec(mod);
          console.log("Captures", lambdaName);
          return `lambda_${lambdaName.groups.lname}_pipeline`;
        })
        .map((pipeline) => {
          console.log(`Executing Pipeline..`, pipeline);
          return executePipelinePromise(pipeline);
        });

      const pipeLineExecutionResults = await Promise.all(
        lambdaPipeLinesPromises
      );
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

// Execute a pipeline

const executePipelinePromise = (pipelineName) => {
  return new Promise((res, rej) => {
    pipeline.startPipelineExecution({ name: pipelineName }, (err, data) => {
      if (err) {
        console.log("Unable to start pipeline");
        console.log(err, err.stack);
        rej(err);
      }
      console.log("Pipeline Started Succesfully", data);
      res(data);
    });
  });
};
