import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';
import { InfraParameter } from '../config/model';

export interface DatabaseStackProps extends cdk.StackProps {
  readonly parameter: InfraParameter;
  readonly vpcResource: ec2.Vpc;
  readonly ec2Resource: ec2.Instance;
}

export class DatabaseStack extends cdk.Stack {
  public readonly rdsInstance: rds.ServerlessCluster;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);
    const { parameter, vpcResource, ec2Resource } = props;

    this.rdsInstance = new rds.ServerlessCluster(this, parameter.rds.id, {
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE,
      },
      engine: rds.DatabaseClusterEngine.AURORA_MYSQL,
      defaultDatabaseName: parameter.rds.database,
      vpc: vpcResource,
      enableDataApi: true,
    });

    this.rdsInstance.connections.allowFrom(
      ec2Resource,
      ec2.Port.tcp(parameter.rds.port),
    );
  }
}
