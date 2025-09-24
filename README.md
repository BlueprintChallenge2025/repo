F25 Repo Creator

Spin up a brand-new GitHub repository inside your org from a tiny serverless API—then kick it off from a clean React UI.

What it is:

Frontend: React + Vite (TypeScript), deployed to Netlify

Backend: AWS Lambda (Node 20) behind API Gateway (REST), deployed via AWS CDK (TypeScript)

Auth: GitHub PAT stored in AWS Secrets Manager

One endpoint: POST /create?name=<repo-name>

Org: BlueprintChallenge2025 (configurable)

Demo

Production UI: [https://blueprintchallenge2025-aryanrawat.netlify.app](url)

API base URL: auto-proxied behind the UI via /api (no editing the UI when the API changes)

Browser (React UI)
     │     POST /api/create?name=my-repo
     ▼
Netlify (static hosting + proxy rule to /api/*)
     │     → https://{apiId}.execute-api.us-east-1.amazonaws.com/prod/create
     ▼
API Gateway (REST)
     │
     ▼
Lambda (Node 20, TypeScript)
     ├─ reads GitHub PAT from Secrets Manager (JSON: {"token":"..."})
     ├─ calls GitHub: POST /orgs/{org}/repos
     └─ returns JSON with clear success/error + CORS headers
What you can do

Type a repo name and click Create Repository

See a green confirmation with a link when it’s created

If it fails (e.g., duplicate name, bad token), see a clear reason

Requirements

Node.js >= 18 (Node 20 recommended)

AWS account with permissions to use CloudFormation, API Gateway, Lambda, and Secrets Manager

AWS CLI configured (aws configure)

AWS CDK v2 (npm i -g aws-cdk optional; we use npx cdk)

(Windows) If you don’t have Docker, we bundle Lambda locally – no extra setup required

# 0) Install dependencies
npm --prefix infra install
npm --prefix services/repo-creator install
npm --prefix web install

1) Bootstrap & deploy the infrastructure (CDK)

Do this once per AWS account/region.

# Bootstrap the environment (replace with your AWS account ID once)
npx cdk bootstrap aws://YOUR_AWS_ACCOUNT_ID/us-east-1

# Build & deploy the stack
Push-Location infra
$env:AWS_LAMBDA_NODEJS_FORCE_LOCAL = "true"   # bundle lambda without Docker
npx cdk deploy F25Stack
Pop-Location

Fetch your API base URL from CloudFormation:

$API_BASE = aws cloudformation describe-stacks --region us-east-1 --stack-name F25Stack `
  --query "Stacks[0].Outputs[?OutputKey=='ApiBaseUrl'].OutputValue" --output text
$API_BASE

2) Store your GitHub PAT in Secrets Manager

Secret name (created by CDK): f25/github/repo-creator

Format must be JSON: {"token":"YOUR_PAT"}

PAT user must have permission to create repos in the org.
For classic PAT, scopes typically include repo and org admin privileges (or use a fine-grained PAT with “Repository administration” permission on the org).

aws secretsmanager put-secret-value `
  --region us-east-1 `
  --secret-id "f25/github/repo-creator" `
  --secret-string "{""token"":""YOUR_PAT""}"

  Verify the secret is valid JSON:

$raw = aws secretsmanager get-secret-value --region us-east-1 `
  --secret-id "f25/github/repo-creator" --query SecretString --output text
$raw          # should look like {"token":"ghp_..."}

3) Run the UI locally

We proxy /api/* to your API in Netlify prod. Locally, just call the API directly by setting the env file (or continue to use the Netlify dev proxy if you’ve set it up).

# Create an env file for the local dev server (optional if using proxy)
Set-Content -Encoding utf8 -NoNewline -Path .\web\.env `
  -Value "VITE_API_BASE_URL=$API_BASE"

# Start the dev server
cd web
npm run dev
# open http://localhost:5173


Tip: If you’ve configured a _redirects file to proxy /api/* locally with netlify dev, you can omit VITE_API_BASE_URL and just use /api.

4) Deploy the UI to Netlify

Netlify config:

Base directory: web

Build command: npm run build

Publish directory: web/dist

Node version: 20

Environment variables: (optional) VITE_API_BASE_URL (only if you don’t proxy)

Proxy rule: Add a _redirects file to route /api/* → API Gateway:

web/public/_redirects

/api/*  https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/:splat  200!


Then:

# build locally (optional)
npm --prefix web run build

# deploy via Netlify CLI (optional)
netlify deploy --prod

API

Endpoint: POST /create?name=<repo-name>

Returns:

201 { success: true, repo: { name, html_url } }

422 { success: false, error: "Repository already exists ..." }

401/403 { success: false, error: "Unauthorized/Forbidden ..." }

400 { success: false, error: "Invalid name: ..." }

500 { success: false, error: "GitHub error ..." }

CORS: OPTIONS /create returns 204 with Access-Control-Allow-* headers

Example (PowerShell):

$API = $API_BASE.TrimEnd('/')
$NAME = "demo-$([DateTime]::UtcNow.ToString('yyyyMMddHHmmss'))"
curl.exe -i -X POST "$API/create?name=$NAME"

Configuration knobs

Lambda (set in CDK stack):

SECRET_NAME — default: f25/github/repo-creator

GITHUB_ORG — default: BlueprintChallenge2025

UI:

Uses /api by default (via Netlify proxy).

If you’d rather call API Gateway directly, set web/.env:

VITE_API_BASE_URL=https://{apiId}.execute-api.us-east-1.amazonaws.com/prod

CI

GitHub Actions lints the Lambda code on each push/PR.

Workflow file: .github/workflows/lint.yml

We use ESLint (flat config) with TypeScript rules and --max-warnings=0.

Run locally:

npm --prefix services/repo-creator run lint

Troubleshooting

“Invalid JSON in secret…”
Your secret’s value must be valid JSON like:

{"token":"ghp_xxx"}


Fix:

aws secretsmanager put-secret-value --region us-east-1 `
  --secret-id "f25/github/repo-creator" `
  --secret-string "{""token"":""ghp_xxx""}"


“Secrets Manager can’t find the specified secret.”

Confirm the name (f25/github/repo-creator) and region (us-east-1).

Check the Lambda environment SECRET_NAME in the CDK stack matches.

“Missing Authentication Token” (API Gateway)

You’re hitting the wrong URL or stage. Re-fetch the base URL from CloudFormation.

Ensure the path is exactly /prod/create (UI uses /api/create which Netlify proxies).

CORS errors in the browser

Our API responds with Access-Control-Allow-Origin: * and supports OPTIONS.

Make sure your Netlify _redirects rule ends with 200! and points to /prod/:splat.

422 “Repository already exists”

The name is already taken in your org. Pick a different name. The UI shows the exact reason.

CDK needs Docker?

We bundle locally to avoid Docker: set
AWS_LAMBDA_NODEJS_FORCE_LOCAL=true before cdk deploy.

Bootstrap errors

Run npx cdk bootstrap aws://YOUR_AWS_ACCOUNT_ID/us-east-1 once per account/region.

Architecture notes & trade-offs

Simple surface area: one POST /create endpoint. Easy to audit and secure.

Secrets Manager, not env: keeps the PAT out of code and config. Rotatable at runtime.

Netlify proxy: gives you a stable /api URL in the UI; you can change the real API without rebuilding the frontend.

Plain JSON responses: humans can read errors; machines can parse them.
