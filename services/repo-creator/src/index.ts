<<<<<<< HEAD

import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const sm = new SecretsManagerClient({});
const GITHUB_ORG = process.env.GITHUB_ORG ?? '';
const SECRET_ARN = process.env.SECRET_ARN ?? '';

let cachedToken: string | undefined;
=======
﻿// services/repo-creator/src/index.ts
import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const sm = new SecretsManagerClient({});
const GITHUB_ORG = process.env.GITHUB_ORG ?? "";
const SECRET_ARN = process.env.SECRET_ARN ?? "";

let cachedToken: string | undefined;

type GithubCreateRepoResponse = {
  name?: string;
  html_url?: string;
  message?: string;
  errors?: unknown;
};
>>>>>>> 5ab442b (chore(eslint): flat config; fix handler typing; remove legacy eslintrc)

function json(statusCode: number, body: unknown) {
  return {
    statusCode,
<<<<<<< HEAD
    headers: { 'Content-Type': 'application/json' },
=======
    headers: { "Content-Type": "application/json" },
>>>>>>> 5ab442b (chore(eslint): flat config; fix handler typing; remove legacy eslintrc)
    body: JSON.stringify(body),
  };
}

<<<<<<< HEAD
function now() {
=======
function now(): string {
>>>>>>> 5ab442b (chore(eslint): flat config; fix handler typing; remove legacy eslintrc)
  return new Date().toISOString();
}

function validateName(name?: string): string | null {
<<<<<<< HEAD
  if (!name) return 'missing required query param: name';
  if (name.length < 1 || name.length > 100) return 'name must be 1-100 chars';
  if (!/^[a-z0-9-_]+$/i.test(name)) return 'name must match ^[a-z0-9-_]+$';
=======
  if (!name) return "missing required query param: name";
  if (name.length < 1 || name.length > 100) return "name must be 1-100 chars";
  if (!/^[a-z0-9-_]+$/i.test(name)) return "name must match ^[a-z0-9-_]+$";
>>>>>>> 5ab442b (chore(eslint): flat config; fix handler typing; remove legacy eslintrc)
  return null;
}

async function getGithubToken(): Promise<string> {
  if (cachedToken) return cachedToken;
<<<<<<< HEAD
  if (!SECRET_ARN) throw new Error('SECRET_ARN not set');

  const res = await sm.send(new GetSecretValueCommand({ SecretId: SECRET_ARN }));
  const secretString = res.SecretString;
  if (!secretString) throw new Error('secret has no SecretString');
=======
  if (!SECRET_ARN) throw new Error("SECRET_ARN not set");

  const res = await sm.send(new GetSecretValueCommand({ SecretId: SECRET_ARN }));
  const secretString = res.SecretString;
  if (!secretString) throw new Error("secret has no SecretString");
>>>>>>> 5ab442b (chore(eslint): flat config; fix handler typing; remove legacy eslintrc)

  const parsed = JSON.parse(secretString) as { token?: string };
  if (!parsed.token) throw new Error('secret JSON must include "token"');

  cachedToken = String(parsed.token);
  return cachedToken;
}

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const requestId = event.requestContext.requestId;

  try {
    if (!GITHUB_ORG) {
<<<<<<< HEAD
      return json(500, { success: false, error: 'GITHUB_ORG not configured', requestId, timestamp: now() });
=======
      return json(500, { success: false, error: "GITHUB_ORG not configured", requestId, timestamp: now() });
>>>>>>> 5ab442b (chore(eslint): flat config; fix handler typing; remove legacy eslintrc)
    }

    const name = event.queryStringParameters?.name;
    const invalid = validateName(name);
    if (invalid) {
      return json(400, { success: false, error: invalid, requestId, timestamp: now() });
<<<<<<< HEAD
    }

    const token = await getGithubToken();

    const resp = await fetch(`https://api.github.com/orgs/${encodeURIComponent(GITHUB_ORG)}/repos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'f25-repo-creator',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        visibility: 'private',
        auto_init: true,
      }),
    });

    const data = (await resp.json().catch(() => ({}))) as any;

    if (!resp.ok) {
      let errorMsg = typeof data?.message === 'string' ? data.message : 'GitHub API error';
      if (resp.status === 422) errorMsg = 'Repository already exists or invalid name';
      if (resp.status === 403) errorMsg = 'Insufficient permissions to create repository';
      if (resp.status === 401) errorMsg = 'Unauthorized: invalid GitHub token';

      return json(resp.status, {
        success: false,
        error: errorMsg,
        details: { githubStatus: resp.status, githubMessage: data?.message, errors: data?.errors },
        requestId,
        timestamp: now(),
      });
    }

=======
    }

    const token = await getGithubToken();

    const resp = await fetch(`https://api.github.com/orgs/${encodeURIComponent(GITHUB_ORG)}/repos`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "f25-repo-creator",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        visibility: "private",
        auto_init: true,
      }),
    });

    const data = (await resp.json().catch(() => ({} as GithubCreateRepoResponse))) as GithubCreateRepoResponse;

    if (!resp.ok) {
      let errorMsg = typeof data?.message === "string" ? data.message : "GitHub API error";
      if (resp.status === 422) errorMsg = "Repository already exists or invalid name";
      if (resp.status === 403) errorMsg = "Insufficient permissions to create repository";
      if (resp.status === 401) errorMsg = "Unauthorized: invalid GitHub token";

      return json(resp.status, {
        success: false,
        error: errorMsg,
        details: { githubStatus: resp.status, githubMessage: data?.message, errors: data?.errors },
        requestId,
        timestamp: now(),
      });
    }

>>>>>>> 5ab442b (chore(eslint): flat config; fix handler typing; remove legacy eslintrc)
    return json(201, {
      success: true,
      repo: { name: data?.name, html_url: data?.html_url },
      requestId,
      timestamp: now(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return json(500, { success: false, error: msg, requestId, timestamp: now() });
  }
};
