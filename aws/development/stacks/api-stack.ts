import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as appsync from '@aws-cdk/aws-appsync-alpha';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { ApiParameter } from '../config/model';
import { LayerVersion } from 'aws-cdk-lib/aws-lambda';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { ApiDefinition, apiDefinitions, layerDefinitions } from '../../../src/lambdas';
import { InfraParameter } from '../../infrastructure/config/model';
import { LambdaStack } from './lambda-nest-stack';

export interface ApiStackProps extends cdk.StackProps {
  readonly apiParameter: ApiParameter;
  readonly infraParameter: InfraParameter;
  readonly vpcResource: ec2.Vpc;
  readonly securityGroupResource: ec2.SecurityGroup;
  readonly rdsResource: rds.ServerlessCluster;
  readonly userPoolResouce: cognito.UserPool;
  readonly userPoolClientResource: cognito.UserPoolClient;
}

export class ApiStack extends cdk.Stack {

  public readonly appSyncInstance: appsync.GraphqlApi;

  public readonly layers: LayerVersion[] = [];

  constructor(scope: cdk.App, id: string, props: ApiStackProps) {
    super(scope, id, props);
    const { apiParameter } = props;

    this.appSyncInstance = new appsync.GraphqlApi(this, apiParameter.appSync.id, {
      name: apiParameter.appSync.name,
      schema: appsync.Schema.fromAsset('graphql/index.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(
              cdk.Duration.days(apiParameter.appSync.apiKeyExpireTime),
            ),
          },
        },
        additionalAuthorizationModes: [
          {
            authorizationType: appsync.AuthorizationType.USER_POOL,
            userPoolConfig: {
              userPool: props.userPoolResouce,
            },
          },
        ],
      },
    });

    new Secret(this, apiParameter.secretManager.id, {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      secretName: apiParameter.secretManager.name,
      generateSecretString: {
        generateStringKey: 'password',
        secretStringTemplate: JSON.stringify({
          appSyncUrl: this.appSyncInstance.graphqlUrl,
          appSyncAPIKey: this.appSyncInstance.apiKey,
        }),
      },
    });

    for (const layer of layerDefinitions) {
      this.layers.push(
        new lambda.LayerVersion(
          this,
          `${apiParameter.lambda.prefixLayerName}-${layer.name}`,
          {
            compatibleRuntimes: [
              lambda.Runtime.NODEJS_14_X,
            ],
            code: lambda.Code.fromAsset(layer.sourcePath),
          },
        ),
      );
    }

    for (const typeApi in apiDefinitions) {
      const apis = apiDefinitions[typeApi]
      const numberOfApisEachStack = 50
      const numberOfNestStacks = Math.ceil(apis.length / numberOfApisEachStack)
      const splitApiArray: ApiDefinition[][] = []

      for (let i = 0; i < numberOfNestStacks; i++) {
        splitApiArray.push([])
      }

      let currentProcessingArrIndex = 0
      for (let i = 0; i < apis.length; i++) {
        splitApiArray[currentProcessingArrIndex].push(apis[i]);
        if (splitApiArray[currentProcessingArrIndex].length >= numberOfApisEachStack) {
          currentProcessingArrIndex++;
        }
      }

      for (let i = 0; i < splitApiArray.length; i++) {
        let indexNestStack = i + 1
        new LambdaStack(
          this,
          `${apiParameter.appSync.id}-${typeApi.toLowerCase()}-${indexNestStack}`,
          {
            layers: this.layers,
            apiDefinitions: splitApiArray[i],
            parentProps: props,
            appSync: this.appSyncInstance
          },
        );
      }
    }
  }
}
