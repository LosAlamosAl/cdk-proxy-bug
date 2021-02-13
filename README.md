# Test code for AWS CDK bug report

AWS CDK seems to ignore (in at least some cases) `proxy=false` on a `LambdaRestApi`.

Setting `proxy=false` on a `LambdaRestApi` appears to be ignored. The resulting lambda function in the API is still proxied.



### Reproduction Steps

I first reported this as a bug on the [`cognito-api-example`](https://github.com/aws-samples/aws-cdk-examples/issues/385) in the `aws-samples/aws-cdk-samples` repository. My own code was experiencing the same bug and I used the example (with similar code to mine) to test the bug. I now believe the bug is in CDK and not that specific example (or my code).

As test code, to reproduce the bug, I've trimmed that example down to the bare minimum and published it at [my GitHub repo](https://github.com/losalamosal/cdk-proxy-bug). Shown below is the relevant code. First, `index.js` that defines the stack, etc.:
```javascript
const { App, Stack } = require("@aws-cdk/core");
const { Function, Runtime, AssetCode } = require("@aws-cdk/aws-lambda");
const { LambdaRestApi, LambdaIntegration } = require("@aws-cdk/aws-apigateway");

class CdkProxyBugStack extends Stack {
  constructor(app, id) {
    super(app, id);

    // Function that returns 201 with "Hello world!"
    const helloWorldFunction = new Function(this, 'helloWorldFunction', {
      code: new AssetCode('src'),
      handler: 'helloworld.handler',
      runtime: Runtime.NODEJS_12_X
    });

    // Rest API backed by the helloWorldFunction
    const helloWorldLambdaRestApi = new LambdaRestApi(this, 'helloWorldLambdaRestApi', {
      restApiName: 'Hello World API',
      handler: helloWorldFunction,
      proxy: false,
    });

    // Hello Resource API for the REST API. 
    const hello = helloWorldLambdaRestApi.root.addResource('HELLO');

    // GET method for the HELLO API resource.
    hello.addMethod('GET', new LambdaIntegration(helloWorldFunction))
  }
}

const app = new App();
new CdkProxyBugStack(app, 'CdkProxyBugStack');
app.synth();
module.exports = { CdkProxyBugStack }
```
and the simple lambda function:
```javascript
exports.handler = async (event) => {
  console.log(event);
  return { statusCode: 201, body: 'Hello world!' };
}
```

### What did you expect to happen?

One expects that this will create a REST API with a single lambda, not proxied.


### What actually happened?

The code works fine, the lambda is called successfully. However, if I visit the API in the AWS console I see the following:
- the Integration Request on the `GET` method shows *Use Lambda Proxy integration*
- the Integration Response box in the UI is greyed out and inactive

### Environment

  - CDK CLI Version  : 1.89.0 (and before)
  - Framework Version: 1.89.0 (and before)
  - Node.js Version: 15.1.0
  - OS: MacOS 10.14.5
  - Language (Version): N/A

--- 

This is :bug: Bug Report
