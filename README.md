# CDK + AppSync + Lambda + Cognito + S3 + RDS + Graphql + Prisma

## installation
- install aws-cli
  - run aws configure (access_key, secret_key)
- yarn 3.2.0

## prepare (first time only)
- cdk bootstrap
- add NO_REPLY_EMAIL as an identity in SES
- create EC2_KEY_PAIR on AWS Console
- yarn install

## create new api:
- yarn makeApi ${typeName}:${fieldName}
- define API in graphql folder
- run yarn gqlgen
- write your code in ${typeName}/${fieldName}/index.ts

## create/update new table in database
- update model in prisma/schema.prisma
- ssh to RDS server through EC2 and map RDS to your localhost (AND KEEP IT ALIVE)
  - command: ssh -i **{EC2-KEY-PEM}** -L **{LOCAL-PORT}**:**{RDS-HOST}**:**{RDS-PORT}** ec2-user@**{EC2-PUBLIC-IP}** -v
- yarn prisma db push 
- yarn prisma generate

## deployment:
- yarn deploy