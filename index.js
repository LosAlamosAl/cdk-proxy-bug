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

