type VpcParameter = {
  id: string;
  publicSubnetName: string;
  privateSubnetName: string;
  cidr: string;
};

type SecurityGroupParameter = {
  id: string;
};

type Ec2Parameter = {
  id: string;
  sshKeyName: string;
};

type RdsParameter = {
  id: string;
  database: string;
  port: number;
};

type CognitoParameter = {
  id: string;
  name: string;
  noReplyEmail: string;
  replyToEmail: string;
  accessTokenExpireTime: number;
  refreshTokenExpireTime: number;
  userPoolGroups: UserPoolGroup[];
};

type UserPoolGroup = {
  id: string;
  groupName: string;
  description: string;
};

type S3Parameter = {
  id: string;
  name: string;
  allowedOrigins: string[];
  allowedHeaders: string[];
  objectLifeTime: number;
};

type CredentialConfig = {
  awsAccessKey: string;
  awsSecretKey: string;
  mailVerifySecretKey: string;
  appSecretKey: string;
  mailRegion: string;
  appRegion: string;
  mailFrom: string;
};

export type InfraParameter = {
  vpc: VpcParameter;
  securityGroup: SecurityGroupParameter;
  ec2: Ec2Parameter;
  rds: RdsParameter;
  cognito: CognitoParameter;
  s3: S3Parameter;
  credentials?: CredentialConfig;
};
