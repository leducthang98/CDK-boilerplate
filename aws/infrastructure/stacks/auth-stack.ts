import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import { InfraParameter } from '../config/model';

export interface AuthStackProps extends cdk.StackProps {
  readonly parameter: InfraParameter;
}

export class AuthStack extends cdk.Stack {

  public readonly userPoolInstance: cognito.UserPool;

  public readonly userPoolClientInstance:cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);
    const { parameter } = props;

    this.userPoolInstance = new cognito.UserPool(this, parameter.cognito.id, {
      userPoolName: parameter.cognito.name,
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: false,
        phone: false,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        phoneNumber: {
          required: false,
          mutable: true,
        },
        givenName: {
          required: false,
          mutable: true,
        },
      },
      customAttributes: {
        createdAt: new cognito.DateTimeAttribute({
          mutable: true,
        }),
        isVerifiedInApp: new cognito.BooleanAttribute({
          mutable: false,
        }),
      },
      passwordPolicy: {
        minLength: 6,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const cfnUserPool = this.userPoolInstance.node
      .defaultChild as cognito.CfnUserPool;

    cfnUserPool.emailConfiguration = {
      emailSendingAccount: 'DEVELOPER',
      replyToEmailAddress: parameter.cognito.replyToEmail,
      from: parameter.cognito.noReplyEmail,
      sourceArn: `arn:aws:ses:${parameter.credentials!.mailRegion}:${
        cdk.Stack.of(this).account
      }:identity/${parameter.cognito.noReplyEmail}`,
    };

    this.userPoolClientInstance = new cognito.UserPoolClient(
      this,
      'user-pool-client',
      {
        userPool: this.userPoolInstance,
        authFlows: {
          custom: true,
          userSrp: true,
        },
        supportedIdentityProviders: [
          cognito.UserPoolClientIdentityProvider.COGNITO,
        ],
        readAttributes: new cognito.ClientAttributes().withStandardAttributes({
          email: true,
        }),
        accessTokenValidity: cdk.Duration.days(
          parameter.cognito.accessTokenExpireTime,
        ),
        refreshTokenValidity: cdk.Duration.days(
          parameter.cognito.refreshTokenExpireTime,
        ),
        idTokenValidity: cdk.Duration.days(
          parameter.cognito.accessTokenExpireTime,
        ),
      },
    );

    props.parameter.cognito.userPoolGroups.forEach(userPoolGroup => {
      new cognito.CfnUserPoolGroup(this, userPoolGroup.id, {
        userPoolId: this.userPoolInstance.userPoolId,
        description: userPoolGroup.description,
        groupName: userPoolGroup.groupName,
      });
    });
  }
}
