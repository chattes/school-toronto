// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;

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
  console.log("Hello World");
  console.log(event);
  console.log(context);

  const isMainBranchRegex = /\/heads\/main/g;
  const isUIPipelineReg = /^ui\/.*/g;
  const isLambdaStopEC2Reg = /^lambdas\/stop-ec2\/.*?/g;
  const isLambdaStartEC2Reg = /^lambdas\/start-ec2\/.*?/g;
  const startUIDeloyment = false;
  const deployLambdaStopEC2 = false;
  const deployLambdaStartEC2 = false;

  const body = event.body || null;
  if (body) {
    const refs = body.ref || null;
    const modified = body.modified || [];
    if (refs && isMainBranchRegex.test(refs)) {
      console.log(
        "Changes Pushed to Main Branch.. We will match a pipeline..."
      );

      for (let mod of modified) {
        if (isUIPipelineReg.test(mod)) startUIDeloyment = true;
        if (isLambdaStopEC2Reg.test(mod)) deployLambdaStopEC2 = true;
        if (isLambdaStartEC2Reg.test(mod)) deployLambdaStartEC2 = true;
      }

      if (startUIDeloyment) console.log("Deploy UI");
      if (deployLambdaStopEC2) console.log("Deploy Lambda STOP EC2");
      if (deployLambdaStartEC2) console.log("Deploy Start EC2");
    }
  }
  return {
    isBase64Encoded: false,
    statusCode: 200,
    headers: {},
    body: "",
  };
};
