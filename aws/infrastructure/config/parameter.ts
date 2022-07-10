import { InfraParameter } from "./model";

const prefix = `${process.env.APP_NAME}-${process.env.STAGE}`;

export const INFRA_PARAMETER: InfraParameter = {
  vpc: {
    id: `${prefix}-vpc`,
    cidr: '10.0.0.0/16',
    privateSubnetName: `${prefix}-private-subnet`,
    publicSubnetName: `${prefix}-public-subnet`,
  },
  securityGroup: {
    id: `${prefix}-sg`,
  },
  ec2: {
    id: `${prefix}-ec2`,
    sshKeyName: `${prefix}-ec2-key-pair`,
  },
  rds: {
    id: `${prefix}-aurora-cluster`,
    database: 'DefaultRDS',
    port: 3306,
  },
  cognito: {
    id: `${prefix}-cognito`,
    name: `${prefix}-user-pool`,
    noReplyEmail: process.env.NO_REPLY_EMAIL || 'leducthang98@gmail.com',
    replyToEmail: process.env.REPLY_TO_EMAIL || 'leducthang98@gmail.com',
    accessTokenExpireTime: 1,
    refreshTokenExpireTime: 30,
    userPoolGroups: [
      {
        id: 'CognitoDefaultGroup',
        groupName: 'DEFAULT',
        description: 'default group',
      }
    ],
  },
  s3: {
    id: `${prefix}-s3`,
    name: `${prefix}-s3-bucket`,
    allowedHeaders: ['*'],
    allowedOrigins: ['*'],
    objectLifeTime: 365,
  },
  credentials: {
    awsAccessKey: process.env.AWS_ACCESS_KEY || '',
    awsSecretKey: process.env.AWS_SECRET_KEY || '',
    mailVerifySecretKey: process.env.MAIL_SECRET || '',
    appSecretKey: process.env.APP_SECRET || '',
    mailRegion: process.env.MAIL_REGION || 'us-west-2',
    appRegion: process.env.APP_REGION || 'ap-northeast-1',
    mailFrom: process.env.NO_REPLY_EMAIL || '',
  },
  
};
