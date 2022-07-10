import 'source-map-support/register';
import 'dotenv/config';
import * as cdk from 'aws-cdk-lib';
import { API_PARAMETER } from '../aws/development/config/parameter';
import { ApiStack } from '../aws/development/stacks/api-stack';
import { INFRA_PARAMETER } from '../aws/infrastructure/config/parameter';
import { AuthStack } from '../aws/infrastructure/stacks/auth-stack';
import { DatabaseStack } from '../aws/infrastructure/stacks/database-stack';
import { NetworkStack } from '../aws/infrastructure/stacks/network-stack';
import { S3Stack } from '../aws/infrastructure/stacks/s3-stack';
import { execSync } from 'child_process';
import { copyPrismaEngines } from '../script/copy-prisma-engine';

const getStackName = (type: string): string => {
  const { APP_NAME, STAGE } = process.env
  return `${APP_NAME}-stack-${type}-${STAGE}`
}

const prepare = async (): Promise<void> => {
  execSync('rm -rf cdk.out')
  execSync('yarn prisma generate')
  await copyPrismaEngines()
}

const main = async (): Promise<void> => {

  await prepare()

  const app = new cdk.App();

  // network-stack: includes vpc, subnets, ec2 bastion host, security group
  const networkStack = new NetworkStack(
    app,
    getStackName('network'),
    {
      parameter: INFRA_PARAMETER,
    },
  );

  // database-stack: includes RDS Serverless Aurora
  const databaseStack = new DatabaseStack(
    app,
    getStackName('database'),
    {
      parameter: INFRA_PARAMETER,
      ec2Resource: networkStack.ec2Instance,
      vpcResource: networkStack.vpcInstance,
    },
  );

  // auth-stack: includes Cognito
  const authStack = new AuthStack(
    app,
    getStackName('auth'),
    {
      parameter: INFRA_PARAMETER,
    },
  );

  // s3-stack: includes S3
  new S3Stack(app, getStackName('s3'), {
    parameter: INFRA_PARAMETER,
  });

  new ApiStack(app, getStackName('api'), {
    apiParameter: API_PARAMETER,
    infraParameter: INFRA_PARAMETER,
    vpcResource: networkStack.vpcInstance,
    securityGroupResource: networkStack.securityGroupInstance,
    rdsResource: databaseStack.rdsInstance,
    userPoolResouce: authStack.userPoolInstance,
    userPoolClientResource: authStack.userPoolClientInstance
  })

}

main().catch((err) => {
  console.error(err);
  process.exit(1);
})