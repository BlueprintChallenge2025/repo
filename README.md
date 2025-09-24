# README.md (root)

# F25 Technical Challenge – Repo Creator

## Overview
A small system that creates GitHub repositories in the org **BlueprintChallenge2025** via:
- **AWS Lambda** (Node/TS) exposed by **API Gateway**
- **React + Vite** web UI to call the API
- **AWS CDK** for deployment
- **GitHub PAT** stored in **AWS Secrets Manager**

## Architecture
- **API**: `POST /create?name=<repo-name>`  
  - Lambda reads PAT from Secrets Manager key: `f25/github/repo-creator` (JSON: `{"token":"<PAT>"}`)  
  - Calls GitHub REST API to create a repo under the organization.  
- **CORS**: API Gateway handles `OPTIONS` and returns `Access-Control-Allow-*` so the UI can call from browser.
- **Web**: React form -> fetch `${VITE_API_BASE_URL}/create?name=...`

```mermaid
flowchart LR
  A[React UI] -- POST /create --> B[API Gateway]
  B --> C[Lambda function]
  C --> D[Secrets Manager (PAT)]
  C --> E[GitHub Org: BlueprintChallenge2025]
