import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { InfraParameter } from '../config/model';

export interface S3StackProps extends cdk.StackProps {
  readonly parameter: InfraParameter;
}

export class S3Stack extends cdk.Stack {
  readonly s3: s3.Bucket;

  constructor(scope: Construct, id: string, props: S3StackProps) {
    super(scope, id, props);
    const { parameter } = props;
    this.s3 = new s3.Bucket(this, parameter.s3.id, {
      bucketName: parameter.s3.name,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.POST,
            s3.HttpMethods.PUT,
          ],
          allowedOrigins: parameter.s3.allowedOrigins,
          allowedHeaders: parameter.s3.allowedHeaders,
          exposedHeaders: ['exposedHeaders'],
        },
      ],
    });
  }
}
