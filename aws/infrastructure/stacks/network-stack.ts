import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { InfraParameter } from '../config/model';

export interface NetWorkStackProps extends cdk.StackProps {
  readonly parameter: InfraParameter;
}

export class NetworkStack extends cdk.Stack {
  public readonly vpcInstance: ec2.Vpc;

  public readonly securityGroupInstance: ec2.SecurityGroup;

  public readonly ec2Instance: ec2.Instance;

  constructor(scope: Construct, id: string, props: NetWorkStackProps) {
    super(scope, id, props);
    const { parameter } = props;

    this.vpcInstance = new ec2.Vpc(this, parameter.vpc.id, {
      cidr: parameter.vpc.cidr,
      maxAzs: 2,
      subnetConfiguration: [
        {
          name: parameter.vpc.publicSubnetName,
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: parameter.vpc.privateSubnetName,
          subnetType: ec2.SubnetType.PRIVATE,
          cidrMask: 24,
        },
      ],
    });

    this.securityGroupInstance = new ec2.SecurityGroup(
      this,
      parameter.securityGroup.id,
      {
        vpc: this.vpcInstance,
      },
    );

    this.securityGroupInstance.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
    );

    this.ec2Instance = new ec2.Instance(this, parameter.ec2.id, {
      vpc: this.vpcInstance,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      securityGroup: this.securityGroupInstance,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO,
      ),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      keyName: parameter.ec2.sshKeyName,
    });
  }
  
}
