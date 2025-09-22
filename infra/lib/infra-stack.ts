import { Duration, RemovalPolicy, Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { RestApi, LambdaIntegration, Cors } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import * as path from 'node:path';

export class InfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const secret = new Secret(this, 'GithubTokenSecret', {
      secretName: 'f25/github/repo-creator',
      description: 'GitHub token JSON: {""token"":""...""}',
      removalPolicy: RemovalPolicy.DESTROY
    });

    const githubOrg = process.env.GITHUB_ORG || 'BlueprintChallenge2025';

    const entry = path.join(__dirname, '..', '..', 'services', 'repo-creator', 'src', 'index.ts');

    const fn = new NodejsFunction(this, 'RepoCreatorFn', {
      entry,
      handler: 'handler',
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(15),
      memorySize: 256,
      tracing: Tracing.ACTIVE,
      environment: { GITHUB_ORG: githubOrg, SECRET_ARN: secret.secretArn },
      bundling: { target: 'es2022', minify: true, sourceMap: true, externalModules: [] }
    });

    secret.grantRead(fn);

    const api = new RestApi(this, 'RepoApi', {
      deployOptions: { stageName: 'prod' },
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: ['POST', 'OPTIONS'],
        allowHeaders: Cors.DEFAULT_HEADERS
      }
    });

    const create = api.root.addResource('create');
    create.addMethod('POST', new LambdaIntegration(fn, { proxy: true }));

    new CfnOutput(this, 'ApiBaseUrl', { value: api.url });
    new CfnOutput(this, 'SecretName', { value: secret.secretName });
    new CfnOutput(this, 'LambdaName', { value: fn.functionName });
  }
}
