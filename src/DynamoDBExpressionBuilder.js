"use strict";

// @TODO "($CONTAINS)", "($BEGINS WITH)", "attribute_exists", "attribute_not_exists", "attribute_type"
const ExpressionsMap = ["($IS)", "($IS NOT)", "($IN)", "($GT)", "($GTE)", "($LT)", "($LTE)", "($BETWEEN)"];
const AND_OPERATOR = "AND";
const OR_OPERATOR = "OR";
var iteratorValue = 0;

class DynamoDBExpressionBuilder {
  constructor(obj) {
    this.obj = obj;
    this.str = "";
    this.attributesNames = {};
    this.attributesValues = {};
  }

  build() {
    try {
      let formated = this.formatRec(this.obj);
      return formated.str;
    } catch (err) {
      return err;
    }
  }

  debug() {
    try {
      let formated = this.formatRec(this.obj);

      Object.keys(formated.attributesValues).forEach(key => {
        let value = formated.attributesValues[key];
        formated.str = formated.str.replace(key, value);
      });

      return formated.str;
    } catch (err) {
      return err;
    }

    // console.log(JSON.stringify(formated.attributesNames));
    // console.log(JSON.stringify(formated.attributesValues));
    // console.log(JSON.stringify(formated.str));
  }

  formatRec(obj, _prefix, _operator) {
    let prefix = _prefix ? _prefix : "";
    var operator = _operator ? _operator : AND_OPERATOR;

    let arrayConditions = [];

    Object.keys(obj).forEach(key => {
      let item = obj[key];
      let temp = undefined;
      let hasNotOperator = this.hasNotOperator(key);
      if (hasNotOperator) {
        key = hasNotOperator;
        prefix = "NOT " + prefix;
      }

      if (key.trim() == this.toOperatorValue(OR_OPERATOR) && typeof item == "object") {
        arrayConditions.push(this.orOperation(item, prefix));
      } else if (typeof item == "object" && item.length != null) {
        // is an array
        let type = this.getTypeOfValue(key, item);
        temp = this.expressionObjToString(type, prefix);
        if (temp) {
          arrayConditions.push(temp);
        }
      } else if (typeof item == "object" && !this.hasOperator(key)) {
        let new_prefix = prefix + this.toAttributeName(key) + ".";
        temp = this.formatRec(item, new_prefix).str;
        if (temp) {
          this.attributesNames[this.toAttributeName(key)] = key;
          arrayConditions.push(temp);
        }
      } else if (typeof item == "object" && this.hasOperator(key)) {
        let type = this.getTypeOfValue(key, item);
        temp = this.expressionObjToString(type, prefix);
        if (temp) {
          arrayConditions.push(temp);
        }
      } else {
        let type = this.getTypeOfValue(key, item);
        this.attributesNames[this.toAttributeName(type.key)] = type.key;
        this.attributesValues[this.toAttributeValue(iteratorValue)] = type.value;
        arrayConditions.push(prefix + this.expressionObjToString(type));
      }
    });
    this.str = arrayConditions
      .filter(v => {
        return v;
      })
      .join(" " + operator + " ");

    return this;
  }

  orOperation(array, prefix) {
    let arrayConditions = [];
    array.forEach(value => {
      if (typeof value == "object") {
        arrayConditions.push("(" + this.formatRec(value, prefix).str + ")");
      }
    });
    let str = arrayConditions
      .filter(v => {
        return v;
      })
      .join(" " + OR_OPERATOR + " ");
    if (arrayConditions.length > 1) {
      return str ? "(" + str + ")" : "";
    }
    return str ? str : "";
  }

  inOperation(key, array, prefix) {
    if (array.length > 0) {
      let inValues = [];
      this.attributesNames[this.toAttributeName(key)] = key;
      array.forEach(value => {
        this.attributesValues[this.toAttributeValue(iteratorValue)] = value;
        inValues.push(this.toAttributeValue(iteratorValue));
        this.incIteratorValue();
      });

      let str = inValues.join(",");

      return "(" + prefix + this.toAttributeName(key) + " IN (" + str + "))";
    } else {
      return "";
    }
  }

  betweenOperation(key, obj, prefix) {
    if (!obj.min || !obj.max) {
      throw "($BETWEEN) must get as value an object with two parameters: min and max. Example: { 'fee ($BETWEEN)' : {min:20, max: 45} }";
    }
    this.attributesNames[this.toAttributeName(key)] = key;

    let min = iteratorValue;
    this.attributesValues[this.toAttributeValue(min)] = obj.min;
    this.incIteratorValue();

    let max = iteratorValue;
    this.attributesValues[this.toAttributeValue(max)] = obj.max;
    this.incIteratorValue();

    return "(" + prefix + this.toAttributeName(key) + " BETWEEN " + this.toAttributeValue(min) + " AND " + this.toAttributeValue(max) + ")";
  }

  hasOperator(value) {
    let regex = /\(\$(.+)\)/;
    let matches = value.match(regex);
    if (matches != null) {
      return true;
    } else {
      return false;
    }
  }

  hasNotOperator(key) {
    let regex = /\(\$NOT\)/;
    let matches = key.match(regex);
    if (matches != null) {
      return key.replace("($NOT)", "");
    } else {
      return false;
    }
  }

  getTypeOfValue(key, value) {
    let type = {
      operator: undefined,
      key: undefined,
      value: undefined
    };

    type.value = value;

    let tempExpression = undefined;
    let cursor = 0;
    do {
      let exp = ExpressionsMap[cursor];
      tempExpression = key.split(exp);
      type.operator = tempExpression.length > 1 ? exp : undefined;
      cursor++;
    } while (type.operator == undefined && cursor < ExpressionsMap.length);

    if (type.operator == undefined) {
      if (this.hasOperator(key)) {
        //Try to use a wrong operator
        throw "Invalid operator";
      }
    }
    type.operator = type.operator == undefined ? "($IS)" : type.operator;
    type.key = tempExpression[0].trim();
    return type;
  }

  expressionObjToString(obj, prefix) {
    let valToReturned = "";
    switch (obj.operator) {
      case "($IS)":
        valToReturned = this.toAttributeName(obj.key) + " = " + this.toAttributeValue(iteratorValue);
        this.incIteratorValue();
        break;
      case "($IS NOT)":
        valToReturned = this.toAttributeName(obj.key) + " <> " + this.toAttributeValue(iteratorValue);
        this.incIteratorValue();
        break;
      case "($GT)":
        valToReturned = this.toAttributeName(obj.key) + " > " + this.toAttributeValue(iteratorValue);
        this.incIteratorValue();
        break;
      case "($LT)":
        valToReturned = this.toAttributeName(obj.key) + " < " + this.toAttributeValue(iteratorValue);
        this.incIteratorValue();
        break;
      case "($GTE)":
        valToReturned = this.toAttributeName(obj.key) + " >= " + this.toAttributeValue(iteratorValue);
        this.incIteratorValue();
        break;
      case "($LTE)":
        valToReturned = this.toAttributeName(obj.key) + " <= " + this.toAttributeValue(iteratorValue);
        this.incIteratorValue();
        break;
      case "($IN)":
        valToReturned = this.inOperation(obj.key, obj.value, prefix);
        break;
      case "($BETWEEN)":
        valToReturned = this.betweenOperation(obj.key, obj.value, prefix);
        break;
      default:
        throw "Invalid operator";
    }
    return valToReturned;
  }

  incIteratorValue() {
    iteratorValue++;
  }

  toAttributeName(val) {
    return "#" + val;
  }

  toAttributeValue(val) {
    return ":" + val;
  }

  toOperatorValue(val) {
    return "($" + val + ")";
  }
}

module.exports = DynamoDBExpressionBuilder;
