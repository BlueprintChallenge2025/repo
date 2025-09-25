# F25 – Serverless Repo Creator

A tiny, production-style demo that creates GitHub repositories **from a simple web page**.  
Click “Create Repository”, type a name, and it spins up a repo inside a test GitHub organization—backed by AWS Lambda and API Gateway, deployed via CDK, and fronted by a Netlify site.

---

## Live Demo & Repo

- **Live site:** https://blueprintchallenge2025-aryanrawat.netlify.app/  
- **Source repo:** https://github.com/BlueprintChallenge2025/repo

> The site is “always on.” If anything fails, it’s usually the backend (AWS) or your GitHub PAT configuration—not Netlify.

---

## What this does

1. You open a small React page and enter a repo name.
2. The page calls a stable API at `/api/create?name=...` (proxied by Netlify).
3. API Gateway forwards that to a Lambda.
4. The Lambda reads a **GitHub Personal Access Token (PAT)** from **AWS Secrets Manager** (never exposed to the browser).
5. The Lambda calls the **GitHub REST API** to create the repo in a dedicated test org.
6. You see a clear success message with a link to the new repo—or a friendly error (e.g., “already exists”).

---

## Why the architecture looks like this

- **Serverless:** Cheap, low-ops, and easy to reason about.
- **Credential hygiene:** The PAT lives in **Secrets Manager**, not in the frontend or code.
- **Stable frontend URL:** The UI is static and deployed to Netlify; it doesn’t change.
- **Stable backend URL:** The UI uses a Netlify **proxy** (`/api/*`) that forwards to API Gateway, so we don’t hardcode the AWS URL in the app.

Browser
│
▼
Netlify (static hosting)
└── /api/* ──► API Gateway (REST) ──► Lambda (Node/TS)
│
└──► AWS Secrets Manager (GitHub PAT)
│
└──► GitHub API (create repo)

markdown
Copy code

---

## What I built (mapped to the challenge)

**Interface**
- ✅ React webpage where users type a repo name and click **Create Repository**.
- ✅ Clear confirmation on success with a link, and helpful error messages on failure.

**Serverless Function**
- ✅ AWS Lambda (Node.js/TypeScript) behind **API Gateway** (REST).

**API**
- ✅ Single endpoint: `POST /create?name=<repo-name>`.
- ✅ Uses a GitHub PAT stored in **Secrets Manager**.
- ✅ Returns structured JSON describing success **or** a precise error (e.g., duplicate repo).

**Documentation**
- ✅ This README explains setup, architecture, and ops in plain English.

**CI**
- ✅ Lint workflow (ESLint) for the function’s source.

**Deployment**
- ✅ **AWS CDK** to provision API Gateway, Lambda, IAM, and Secret.
- ✅ **Netlify** for the web app with a permanent production URL.

**Deliverables**
- ✅ Repo URL & Deployment URL (see above).

---

## How to run it locally (optional for reviewers)

> You do **not** need this to try the live demo, but it’s here for completeness.

1. **Install Node 20+** and **AWS CLI** with credentials for the target account.
2. From repo root:
   ```bash
   npm --prefix web ci
   npm --prefix web run dev
Open http://localhost:5173/
The UI calls /api/*, which Netlify handles in production. Locally, use the curl commands below to talk to the live API directly if you want to sanity-check:

bash
Copy code
API="https://m2x7ksgp3f.execute-api.us-east-1.amazonaws.com/prod"
NAME="demo-$RANDOM"
curl -i -X POST "$API/create?name=$NAME"
How the backend is deployed
The CDK stack creates:

AWS::ApiGateway::RestApi with a /create resource and CORS enabled.

AWS::Lambda::Function (Node.js 20) handling POST /create.

AWS::SecretsManager::Secret (name like f25/github/repo-creator) holding the PAT as JSON.

Important: The secret’s value must be valid JSON:

json
Copy code
{"token":"ghp_..."}
If you see errors like “Invalid JSON in secret” or “Secrets Manager can’t find the secret,” it means the value is not JSON or the name/region doesn’t match what the Lambda expects.

Security notes
The GitHub PAT must have repo and admin:org scope (or the minimum required for creating repos in your test org).

It’s stored in Secrets Manager (never in the frontend code or environment).

Rotate the PAT periodically:

Create a new token in GitHub.

Update the secret value to {"token":"ghp_new..."}.

No frontend changes required.

Error messages you might see (and what they mean)
“Already exists” – The repo name is taken in the org. Try another name.

“Missing Authentication Token” – Wrong API path or stage (e.g., /prod) or method mismatch.

“CORS” errors – CORS headers weren’t returned (fixed in API) or you’re calling the raw API Gateway URL directly from the browser. Use the Netlify site or the /api/* proxy.

“Secrets Manager can't find the specified secret” – The Lambda looked up a secret name that doesn’t exist in that region. Confirm the secret name and region match the CDK outputs.

Operational notes
The Netlify site URL is stable and always live.

If you redeploy the API Gateway and its base URL changes, the Netlify proxy keeps the UI working without code changes.

Costs are minimal (serverless). Delete the stack to stop charges.

What would I improve with more time?
Add an org-selector or visibility dropdown (public/private) in the UI.

Add unit tests for the Lambda (e.g., mocking GitHub responses).

Add rate-limit feedback if GitHub throttles requests.

Add an activity log (CloudWatch Insights link from the UI).

Add GitHub branch protections or repo templating on creation.

Quick reference
Endpoint: POST /create?name=<repo-name>

Success response:

json
Copy code
{
  "success": true,
  "repo": { "name": "<name>", "html_url": "https://github.com/<org>/<name>" }
}
Failure response (example):

json
Copy code
{
  "success": false,
  "error": "Repository already exists: <name>"
}
Contact
If something breaks on the demo site, it’s almost always the backend secret configuration or AWS stack drift. Check:

CloudFormation stack outputs (API base URL)

Lambda CloudWatch logs for the request ID shown in the UI

Secrets Manager value format ({"token":"..."}")

Thanks for reading and trying the demo!

