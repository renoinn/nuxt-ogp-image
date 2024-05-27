import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Function, Runtime, AssetCode, FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambda = new Function(this, 'OgpImage', {
      functionName: 'OgpImage',
      handler: 'index.handler',
      runtime: Runtime.NODEJS_20_X,
      code: new AssetCode(`../.output/server/`),
      memorySize: 512,
      timeout: Duration.seconds(30)
    });
    const url = lambda.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    });
  }
}
