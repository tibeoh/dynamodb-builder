const DynamoDBExpressionBuilder = require("../src/DynamoDBExpressionBuilder");

var assert = require("assert");
var should = require("should");

describe("DynamoDBExpressionBuilder", function() {
  describe("($IS)", function() {
    it("1.", function() {
      let filter = { foo: "bar" };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("#foo = bar");
    });
    it("2.", function() {
      let filter = { "foo($IS)": "bar" };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("#foo = bar");
    });
    it("3.", function() {
      let filter = { "foo ($IS)": "bar" };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("#foo = bar");
    });
    it("4.", function() {
      let filter = { "foo ($IS) ": "bar" };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("#foo = bar");
    });
    it("5.", function() {
      let filter = { " foo ($IS) ": "bar" };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("#foo = bar");
    });
    it("6.", function() {
      let filter = { fee: { " foo ($IS) ": "bar" } };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("#fee.#foo = bar");
    });
    it("7.", function() {
      let filter = { fee: { " foo ": "bar" } };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("#fee.#foo = bar");
    });
    it("8.", function() {
      let filter = { faa: { fee: { " foo ($IS) ": "bar" } } };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("#faa.#fee.#foo = bar");
    });
    it("9.", function() {
      let filter = { "faa.point": { fee: { " foo ($IS) ": "bar" } } };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("#faa.point.#fee.#foo = bar");
    });
    it("10.", function() {
      let filter = { fee: { " foo ($IS) ": "bar", faa: "fii" } };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("#fee.#foo = bar AND #fee.#faa = fii");
    });
  });

  describe("($OR) ($IS)", function() {
    it("1.", function() {
      let filter = {
        faa: {
          "($OR)": [{ fee: { " foo ($IS) ": "bar" } }, { fuu: "foo" }]
        }
      };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("((#faa.#fee.#foo = bar) OR (#faa.#fuu = foo))");
    });
    it("2.", function() {
      let filter = {
        "($OR)": [{ "foo ($IS) ": "bar", fuu: "foo" }, { "foo ($IS) ": "fee", fuu: "poo" }]
      };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("((#foo = bar AND #fuu = foo) OR (#foo = fee AND #fuu = poo))");
    });
    it("3.", function() {
      let filter = {
        "($OR)": [{ "foo ($IS) ": "bar", fuu: "foo" }, { "foo ($IS) ": "fee", fuu: "poo" }],
        gee: "ree"
      };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("((#foo = bar AND #fuu = foo) OR (#foo = fee AND #fuu = poo)) AND #gee = ree");
    });
    it("4.", function() {
      let filter = {
        gee: "ree",
        "($OR)": [{ "foo ($IS) ": "bar", fuu: "foo" }, { "foo ($IS) ": "fee", fuu: "poo" }]
      };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("#gee = ree AND ((#foo = bar AND #fuu = foo) OR (#foo = fee AND #fuu = poo))");
    });
    it("5.", function() {
      let filter = {
        faa: {
          gee: "ree",
          "($OR)": [{ "foo ($IS) ": "bar", fuu: "foo" }, { "foo ($IS) ": "fee", fuu: "poo" }]
        }
      };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("#faa.#gee = ree AND ((#faa.#foo = bar AND #faa.#fuu = foo) OR (#faa.#foo = fee AND #faa.#fuu = poo))");
    });
    it("6.", function() {
      let filter = {
        faa: {
          gee: "ree",
          gaa: {
            gii: { "fuu ($IS)": "tree" },
            "($OR)": [{ "foo ($IS) ": "bar", fuu: "foo" }, { "foo ($IS) ": "fee", fuu: "poo" }]
          }
        }
      };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("#faa.#gee = ree AND #faa.#gaa.#gii.#fuu = tree AND ((#faa.#gaa.#foo = bar AND #faa.#gaa.#fuu = foo) OR (#faa.#gaa.#foo = fee AND #faa.#gaa.#fuu = poo))");
    });
    it("7.", function() {
      let filter = {
        gee: "ree",
        "($OR)": []
      };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("#gee = ree");
    });
    it("8.", function() {
      let filter = {
        gee: "ree",
        fee: { lee: { "($OR)": [] } }
      };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("#gee = ree");
    });
  });

  describe("($IS NOT)", function() {
    it("1.", function() {
      let filter = { "foo ($IS NOT)": true };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("#foo <> true");
    });
  });

  describe("($GT)", function() {
    it("1.", function() {
      let filter = { "foo ($GT)": 100 };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("#foo > 100");
    });
  });

  describe("($LT)", function() {
    it("1.", function() {
      let filter = { faa: { "foo ($LT)": 100 } };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("#faa.#foo < 100");
    });
  });

  describe("($GT) ($LT)", function() {
    it("1.", function() {
      let filter = { "($OR)": [{ "foo ($LT)": 100 }, { "foo ($GT)": 1000 }] };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("((#foo < 100) OR (#foo > 1000))");
    });
    it("2.", function() {
      let filter = { "fee($GT)": 400, "($OR)": [{ "foo ($LT)": 100 }, { "foo ($GT)": 1000 }] };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("#fee > 400 AND ((#foo < 100) OR (#foo > 1000))");
    });
  });

  describe("($GTE)", function() {
    it("1.", function() {
      let filter = { "foo ($GTE)": 100 };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("#foo >= 100");
    });
  });

  describe("($LTE)", function() {
    it("1.", function() {
      let filter = { faa: { "foo ($LTE)": 100 } };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("#faa.#foo <= 100");
    });
  });

  describe("($IN)", function() {
    it("1.", function() {
      let filter = { faa: { "foo ($IN)": ["yellow", "black"] } };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("(#faa.#foo IN (yellow,black))");
    });
    it("2.", function() {
      let filter = { fee: { faa: { "foo ($IN)": ["yellow", "black"] } } };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("(#fee.#faa.#foo IN (yellow,black))");
    });
    it("3.", function() {
      let filter = { fee: { faa: { "foo ($IN)": ["yellow", "black"] } }, gee: "blue" };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("(#fee.#faa.#foo IN (yellow,black)) AND #gee = blue");
    });
    it("4.", function() {
      let filter = { feee: "tre", faa: { "foo ($IN)": [] }, gee: "oui" };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("#feee = tre AND #gee = oui");
    });
  });

  describe("($NOT) ($IN)", function() {
    it("1.", function() {
      let filter = { faa: { "foo ($NOT) ($IN)": ["yellow", "black"] } };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("(NOT #faa.#foo IN (yellow,black))");
    });
    it("2.", function() {
      let filter = { fee: { faa: { "foo ($NOT) ($IN)": ["yellow", "black"] } } };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("(NOT #fee.#faa.#foo IN (yellow,black))");
    });
    it("3.", function() {
      let filter = { fee: { faa: { "foo ($NOT) ($IN)": ["yellow", "black"] } }, gee: "blue" };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("(NOT #fee.#faa.#foo IN (yellow,black)) AND #gee = blue");
    });
  });

  describe("($OR) ($IN)", function() {
    it("1.", function() {
      let filter = {
        faa: {
          "($OR)": [{ "foo ($IN)": ["yellow", "black"] }, { "fii ($IN)": ["blue", "green"] }]
        }
      };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("(((#faa.#foo IN (yellow,black))) OR ((#faa.#fii IN (blue,green))))");
    });
  });

  describe("($BETWEEN)", function() {
    it("1.", function() {
      let filter = { faa: { "foo ($BETWEEN)": { min: 210, max: 300 } } };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("(#faa.#foo BETWEEN 210 AND 300)");
    });
  });

  describe("Invalid operator", function() {
    it("1.", function() {
      let filter = { faa: { "foo ($INVALID_OPERATOR)": 100 } };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("Invalid operator");
    });
    it("2.", function() {
      let filter = { faa: { "foo $($ IN )": 100 } };
      let DDBExprParser = new DynamoDBExpressionBuilder(filter);
      DDBExprParser.debug().should.equal("Invalid operator");
    });
  });
});
