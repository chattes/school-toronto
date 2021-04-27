// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
const aws = require("aws-sdk")
const axios = require('axios')
aws.config.update({ region: "us-east-2" });
const ddb = new aws.DynamoDB.DocumentClient()
let response;

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
        response = {
            'statusCode': 200,
        }
        for(const record of event.Records){
            console.log("Message created at :::", record.body)
            const oRecord = JSON.parse(record.body)
            const schoolUrl = oRecord?.url
            const schoolId = oRecord?.id
            const rating = oRecord?.rating
            if(!schoolId || !schoolUrl){
                console.log("Error::Cannot fetch school")
                return response
            }
            console.log("Fetching school coordinates...")
            const response = await axios({
                method: "get",
                url: buildUrl(schoolUrl),
                timeout: 5000
            })
            if(response.status !== 200) {
                console.log("Unable to fetch School Data")
                return response
            }
            const {data} = response
            const {latitude, longitude, boundaries} = data

            const school_coords = {
                latitude, longitude, boundaries
            }

            const updateSchoolData = {

                TableName: 'schools-toronto',
                Key: {
                    'school-id': schoolId,
                    'eqao-rating': rating
                },
                UpdateExpression: "set #location_data = :location",
                ExpressionAttributeNames: {
                    "#location_data": "location_data"
                },
                ExpressionAttributeValues: {
                    ":location": school_coords
                }
            }

            console.log("Updating school data...", JSON.stringify(updateSchoolData))

            const updateLocationRes = await ddb.update(updateSchoolData).promise()
            console.log(updateLocationRes)

            return
            
        }
    } catch (err) {
        console.log(err);
        return;
    }

};

const buildUrl = url => (`https://www.scholarhood.ca${url}/map.json`)
