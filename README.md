F25 – Serverless Repo Creator

This is a small but production style demo that lets you create GitHub repositories from a simple web page.

You open the site, type a repository name, click Create Repository, and a new repo is created inside a test GitHub organization. Behind the scenes it uses AWS Lambda and API Gateway, is deployed with CDK, and the frontend is hosted on Netlify.

The goal was to keep the system simple, secure, and realistic, not just a toy script.

Live demo and source

Live site: https://blueprintchallenge2025-aryanrawat.netlify.app/

Source repo: https://github.com/BlueprintChallenge2025/repo

The site is always live. If something breaks, it is almost always related to AWS or the GitHub Personal Access Token configuration, not Netlify.

How it works

At a high level, this is the flow:

You open a small React app and enter a repository name.

The frontend sends a request to /api/create?name=....

Netlify proxies that request to API Gateway.

API Gateway triggers a Lambda function.

The Lambda pulls a GitHub Personal Access Token from AWS Secrets Manager.

The Lambda calls the GitHub REST API to create the repository.

You get a success message with a link to the new repo, or a clear error if something goes wrong.

The GitHub token never touches the browser and is never hardcoded anywhere.

Why it is built this way

I intentionally kept the architecture simple but realistic.

Serverless: Low overhead, low cost, and easy to operate.

Secure credentials: The GitHub token lives in AWS Secrets Manager, not in frontend code or environment variables.

Stable frontend: The Netlify site is static and does not change when the backend changes.

Stable API path: The frontend always calls /api/*, and Netlify handles forwarding to API Gateway. This avoids hardcoding AWS URLs into the app.

Rough flow:

Browser
→ Netlify (static site)
→ /api/* proxy
→ API Gateway
→ Lambda
→ Secrets Manager
→ GitHub API

What I built

Frontend

A simple React interface where users enter a repo name and click a button.

Clear success messages with a direct link to the created repository.

Friendly error messages for common cases like duplicate names.

Backend

A Node.js and TypeScript AWS Lambda function.

Exposed through API Gateway with CORS enabled.

Single endpoint that handles repo creation.

API

POST /create?name=<repo-name>

Uses a GitHub PAT stored securely in Secrets Manager.

Returns structured JSON for both success and failure cases.

Infrastructure

AWS CDK to define and deploy API Gateway, Lambda, IAM permissions, and the secret.

Netlify for frontend hosting with a permanent URL.
What I would improve with more time

Add visibility options like public vs private repos.

Add repo templates or default branch protections.

Add unit tests for the Lambda with mocked GitHub responses.

Add basic rate limit handling and feedback.

Add a simple activity log or CloudWatch link.

CI

Basic linting workflow for the backend function.
