"use strict";

const DynamoDBExpressionBuilder = require("./DynamoDBExpressionBuilder");

class DynamoDBBuilder {
  constructor() {
    this.table_name = undefined;
    this.index_name = undefined;
    this.key_condition_expression_obj = undefined;
    this.key_condition_expression = undefined;
    this.key_filter_expression_obj = undefined;
    this.key_filter_expression = undefined;
    this.scan_index_forward = undefined;
    this.expression_attribute_names = {};
    this.expression_attribute_values = {};
  }

  setTableName(tableName) {
    this.table_name = tableName;
    return this;
  }

  setIndexName(indexName) {
    this.index_name = indexName;
    return this;
  }

  setKeyConditionExpression(keyConditionExpressionObj) {
    this.key_condition_expression_obj = keyConditionExpressionObj;
    let expression = new DynamoDBExpressionBuilder(keyConditionExpressionObj);
    this.key_condition_expression = expression.build();
    this.expression_attribute_names = this.mergeObjects(this.expression_attribute_names, expression.attributesNames);
    this.expression_attribute_values = this.mergeObjects(this.expression_attribute_values, expression.attributesValues);
    return this;
  }

  setFilterExpression(keyFilterExpressionObj) {
    this.key_filter_expression_obj = keyFilterExpressionObj;
    let expression = new DynamoDBExpressionBuilder(keyFilterExpressionObj);
    this.key_filter_expression = expression.build();
    this.expression_attribute_names = this.mergeObjects(this.expression_attribute_names, expression.attributesNames);
    this.expression_attribute_values = this.mergeObjects(this.expression_attribute_values, expression.attributesValues);
    return this;
  }

  setScanIndexForward(scanIndexForward) {
    this.scan_index_forward = scanIndexForward;
    return this;
  }

  mergeObjects(obj1, obj2) {
    return Object.assign(obj1, obj2);
  }

  build() {
    return {
      TableName: this.table_name,
      IndexName: this.index_name,
      KeyConditionExpression: this.key_condition_expression,
      FilterExpression: this.key_filter_expression,
      ExpressionAttributeNames: this.expression_attribute_names,
      ExpressionAttributeValues: this.expression_attribute_values,
      ScanIndexForward: this.scan_index_forward
    };
  }
}

module.exports = DynamoDBBuilder;
