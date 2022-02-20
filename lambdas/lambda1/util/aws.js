// var AWS = require('aws-sdk');
const { DynamoDBClient,
    ListTablesCommand,
    CreateTableCommand
} = require('@aws-sdk/client-dynamodb');
const dynamodb = new DynamoDBClient({});

// var dynamodb = new AWS.DynamoDB();

exports.getDynamoDB = () => {
    return dynamodb;
};

const table_params = {
    TableName: process.env.DYNAMODB_PROFILETABLE,
    AttributeDefinitions: [
        {
            AttributeName: "id",
            AttributeType: "S"
        }
    ],
    KeySchema: [
        {
            AttributeName: "id",
            KeyType: "HASH"
        }
    ],
    BillingMode: 'PAY_PER_REQUEST',
    SSESpecification: {
        Enabled: true,
        KMSMasterKeyId: process.env.KMS_KEY_NAME,
        SSEType: 'KMS'
    },
};

exports.setupAWSResources = async () => {
    let readyToServe = true;
    let tables = await dynamodb.send(new ListTablesCommand({}))
    
    if (!tables ||
        !tables.TableNames ||
        tables.TableNames.indexOf(process.env.DYNAMODB_PROFILETABLE) < 0) {
        console.log("AWS: Now creating DynamoDB table", process.env.DYNAMODB_PROFILETABLE);
        try {
            ret = await dynamodb.send(new CreateTableCommand(table_params))
        } 
        catch (error) {
            console.log("AWS: Error creating DynamoDB table", process.env.DYNAMODB_PROFILETABLE, error)
            readyToServe = false;
        }
    } 
    else {
        console.log("AWS: There is already DynamoDB table.")
    }
    return readyToServe;
}