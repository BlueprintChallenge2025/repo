# F25 Technical Challenge — Codebase Deployment Serverless Function

**Owner org:** BlueprintChallenge2025  
**API:** AWS API Gateway + Lambda (Node 20) via **AWS CDK**  
**UI:** React + Vite (TypeScript), deployed on Netlify

## What it does
- POST **`/create?name=<repo-name>`** → creates a repository in GitHub org **BlueprintChallenge2025**.
- Lambda reads a GitHub **PAT** from AWS Secrets Manager and calls GitHub REST API.
- CORS enabled for the web app.

## Quick Start (Local)
# API base from CloudFormation
aws cloudformation describe-stacks --region us-east-1 --stack-name F25Stack \
  --query "Stacks[0].Outputs[?OutputKey=='ApiBaseUrl'].OutputValue" --output text

# UI (from repo root)
cd web
cp .env.example .env   # or create and set VITE_API_BASE_URL
npm ci
npm run dev
