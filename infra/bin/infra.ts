﻿#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { InfraStack } from '../lib/infra-stack';

const app = new App();
new InfraStack(app, 'F25Stack', {
  env: { region: process.env.CDK_DEFAULT_REGION || 'us-east-1', account: process.env.CDK_DEFAULT_ACCOUNT }
});
