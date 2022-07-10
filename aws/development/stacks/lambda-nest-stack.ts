import { GraphqlApi, LambdaDataSource } from '@aws-cdk/aws-appsync-alpha';
import * as appsync from 'aws-cdk-lib/aws-appsync'
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { LayerVersion } from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { ApiStackProps } from './api-stack';
import { ApiDefinition, ResolverTypeName } from '../../../src/lambdas';

export interface LambdaStackProps extends cdk.NestedStackProps {
  readonly layers: LayerVersion[];

  readonly apiDefinitions: ApiDefinition[];

  readonly parentProps: ApiStackProps;

  readonly appSync: GraphqlApi;
}

export class LambdaStack extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    for (const api of props.apiDefinitions) {
      this.createResolver(
        api.name,
        props.parentProps,
        props.layers,
        props.appSync,
        api.type,
      );
    }
  }

  private createResolver(
    name: string,
    props: ApiStackProps,
    layers: LayerVersion[],
    appSync: GraphqlApi,
    typeName: ResolverTypeName,
  ): void {

    const resolver = new NodejsFunction(this, name, {
      runtime: lambda.Runtime.NODEJS_14_X,
      memorySize: 1024,
      vpc: props.vpcResource,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE,
      },
      securityGroups: [props.securityGroupResource],
      timeout: cdk.Duration.seconds(30),
      handler: 'handler',
      entry: path.join(
        __dirname,
        `/../../../src/lambdas/${typeName}/${name}/index.ts`,
      ),
      architecture: cdk.aws_lambda.Architecture.ARM_64,
      bundling: {
        commandHooks: {
          beforeBundling(_inputDir: string, _outputDir: string) {
            return [];
          },
          beforeInstall(inputDir: string, outputDir: string) {
            return [];
          },
          afterBundling(_inputDir: string, outputDir: string) {
            return [
              `cp -R ${__dirname}/../../../prisma/schema.prisma ${outputDir}/`,
              `cp -R ${__dirname}/../../../src/lambdas/Layer/dblayer/nodejs/node_modules/.prisma/client/libquery_engine-linux-arm64-openssl-1.0.x.so.node ${outputDir}/`
            ];
          },
        },
      },
      layers,
      environment: {
        STAGE: process.env.STAGE || '',
        SECRET_ID: props.rdsResource.secret?.secretArn || '',
        USER_POOL_ID: props.userPoolResouce.userPoolId,
        USER_POOL_CLIENT_ID: props.userPoolClientResource.userPoolClientId,
        APP_AWS_ACCESS_KEY: props.infraParameter.credentials!.awsAccessKey,
        APP_AWS_SECRET_KEY:
          props.infraParameter.credentials!.awsSecretKey,
        APP_REGION: props.infraParameter.credentials!.appRegion,
        AWS_S3_BUCKET_NAME: props.infraParameter.s3.name,
        MAIL_SECRET: props.infraParameter.credentials!.mailVerifySecretKey,
        MAIL_REGION: props.infraParameter.credentials!.mailRegion,
        MAIL_FROM: props.infraParameter.credentials!.mailFrom,
      },
    });

    resolver.addToRolePolicy(
      new cdk.aws_iam.PolicyStatement({
        effect: cdk.aws_iam.Effect.ALLOW,
        actions: ['secretsmanager:GetSecretValue'],
        resources: ['*'],
      }),
    );

    new LambdaDataSource(this, `${name}DataSource`, {
      api: appSync,
      lambdaFunction: resolver,
    }).createResolver({
      typeName,
      fieldName: name,
    });

  }
}
