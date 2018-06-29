"use strict";

const DynamoDBBuilder = require("./src/DynamoDBBuilder");

const AWS = require("aws-sdk");
AWS.config.update({ region: "eu-central-1" });

var documentClient = new AWS.DynamoDB.DocumentClient({
  region: "eu-central-1"
});

let dynamoDBBuilder = new DynamoDBBuilder();

let filters = {
  meta_data: {
    "created_at ($LT)": 1528985994503,
    "category ($IN)": ["thriller", "comedy"]
  }
};

let params = dynamoDBBuilder
  .setTableName("movies")
  .setFilterExpression(filters)
  .build();

documentClient
  .scan(params)
  .promise()
  .then(result => {
    console.log(result);
  });
