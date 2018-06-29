# Builder for Amazon DynamoDB

## Features

- Build params object for DynamoDB queries
- Create filters object readable and it will be transform for the Amazon DynamoDB parameter syntax

## Installation

```
npm install dynamodb-builder
```

## How to use?

```
const DynamoDBBuilder = require("dynamodb-builder");

let filters = {
  meta_data: {
    "number_of_views ($GT)": 1000000
  }
};

let dynamodbBuilder = new DynamoDBBuilder();

let params = dynamodbBuilder
  .setTableName("movies")
  .setIndexName("genre_index")
  .setKeyConditionExpression({ genre: "comedy", "year ($GT)": 2010 })
  .setFilterExpression(filters)
  .setScanIndexForward(false)
  .build();
```

Now you have to use `params` variable for your DynamoDB query.

```
const AWS = require("aws-sdk");
AWS.config.update({ region: "eu-central-1" });

var documentClient = new AWS.DynamoDB.DocumentClient({
  region: "eu-central-1"
});

documentClient
  .query(params)
  .promise()
  .then(result => {
    result.Items.map(item => {
      console.log(item.title);
    });
  });
```

## DynamoDBBuilder documentation

- setTableName(name_of_table)
- setIndexName(index_name)
- setKeyConditionExpression(key_condition_object) : `key_condition_object` is an DynamoDBExpression with partition key (and sort key) (take a look to the documentation bellow)
- setFilterExpression(filters) : `filters` is an DynamoDBExpression (take a look to the documentation bellow)
- setScanIndexForward(boolean)

## DynamoDBExpressionBuilder documentation

List of opeartors:

- ($IS)
- ($IS NOT)
- ($IN)
- ($GT)
- ($GTE)
- ($LT)
- ($LTE)
- ($BETWEEN)
- ($NOT)
- ($OR)

### Examples

```
let filters = {
  meta_data: {
    "year": 2018,                                           // meta_data.year = 2018
    "original_language ($IS)": "English",                   // meta_data.original_language = "English",
    "runtime ($LTE)" : 5400,                                // meta_data.runtime <= 5400
    "producer ($IN)": ["Avi Arad", "Syed Aman Bachchan"],   // meta_data.producer IN ("Avi Arad", "Syed Aman Bachchan")
    "revenue ($GT)": 10000000,                              // meta_data.revenue > 10000000
    "vote_average ($GTE)": 4,                               // vote_average >= 5
    "budget ($BETWEEN)": { min: 10000000, max: 200000000},  // meta_data.budget BETWEEN 10000000 AND 200000000
    "vote_count ($NOT) ($LT)": 20000                        // NOT meta_data.vote_count < 20000
  }
};
```

Query looks like:

```
meta_data.year = 2018 AND meta_data.original_language = "English" AND meta_data.runtime <= 5400 AND meta_data.producer IN ("Avi Arad", "Syed Aman Bachchan") AND meta_data.revenue > 10000000 AND vote_average >= 5 AND meta_data.budget BETWEEN 10000000 AND 200000000 AND NOT meta_data.vote_count < 20000
```

### ($OR) example

Particularity : ($OR) should be the key of the object.

```
let filters = {
  meta_data: {
    "($OR)": [
      {"vote_count ($NOT) ($LT)": 20000},
      {"vote_average ($GTE)": 4}
    ]
  }
};
```

Query looks like:

```
(NOT meta_data.vote_count < 20000) OR (vote_average >= 5)
```

## TODO

- Add Comparison Operator and Function Reference missing: ("($CONTAINS)", "($BEGINS WITH)", "attribute_exists", "attribute_not_exists", "attribute_type")

```

```
