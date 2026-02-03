# Deployr -- Full Project Documentation (v1)

## Overview

Deployr is a GitHub-Actions--style deployment automation platform that
enables developers to deploy applications to VPS and shared hosting
(cPanel) using self-hosted runners.

The platform prioritizes **trust, transparency, and control**: - The
backend never accesses user servers - All builds and deployments run on
user-controlled runners - The platform acts only as a coordination layer

> Goal: Make any server feel like Vercel --- without locking users in.

------------------------------------------------------------------------

## Core Principles

-   Self-hosted execution first
-   Opinionated, boring workflows
-   Least-privilege security
-   CLI-first developer experience
-   Free-first adoption model

------------------------------------------------------------------------

## Non‑Goals (v1)

-   Docker / Kubernetes orchestration
-   Auto-scaling
-   Blue‑green deployments
-   Multi‑server deployments
-   Billing or subscriptions

------------------------------------------------------------------------

## System Architecture

### Control Plane (Backend)

-   Laravel (PHP)
-   API‑first
-   Manages users, projects, runners, and jobs
-   Never executes user code
-   Never stores SSH keys

### Execution Plane (Runner)

-   Go static binary
-   Installed on user VPS or local machine
-   Executes all commands
-   Holds secrets locally

### Developer Interface (CLI)

-   Node.js
-   Installed locally via npm
-   Triggers deployments
-   Reads `deploy.yaml`

------------------------------------------------------------------------

## Trust Model

  Component   Responsibility   Access
  ----------- ---------------- ---------------------------
  Backend     Orchestration    Metadata only
  CLI         Trigger          API token
  Runner      Execution        Full local access
  Server      Hosting          Never accessed by backend

Hard rule: **The backend must never be able to deploy an app by
itself.**

------------------------------------------------------------------------

## User Workflow

1.  Sign in via GitHub OAuth
2.  Install CLI
3.  Initialize project
4.  Install runner
5.  Deploy
6.  Monitor logs

------------------------------------------------------------------------

## Deployment Workflow (Canonical)

1.  CLI triggers deployment
2.  Backend queues job
3.  Runner polls for job
4.  Repository cloned
5.  Framework detected
6.  Environment validated
7.  Build commands executed
8.  Artifacts deployed
9.  Post‑deploy tasks
10. Health check
11. Status & logs reported

------------------------------------------------------------------------

## Configuration File (`deploy.yaml`)

``` yaml
project:
  name: example-app
  framework: laravel
  target: vps

repo:
  branch: main

server:
  path: /var/www/example-app
```

------------------------------------------------------------------------

## Supported Frameworks

-   Laravel
-   Next.js

------------------------------------------------------------------------

## Command Matrix

### Laravel → VPS

-   composer install --no-dev
-   php artisan migrate --force
-   php artisan optimize
-   restart php-fpm

### Laravel → cPanel

-   composer install --no-dev
-   optional npm run build
-   zip and upload via FTP or cPanel API

### Next.js → VPS

-   npm install
-   npm run build
-   pm2 start npm --name app -- start

### Next.js → cPanel

-   npm install
-   npm run build
-   npm run export
-   upload /out directory

------------------------------------------------------------------------

## Backend API (High Level)

-   POST /api/auth/github
-   POST /api/projects
-   POST /api/jobs
-   GET /api/jobs/{id}
-   POST /api/runner/register
-   GET /api/runner/jobs
-   POST /api/runner/jobs/{id}/status

------------------------------------------------------------------------

## Database Models

### User

-   id
-   name
-   github_id
-   api_token

### Project

-   id
-   user_id
-   repo_url
-   framework
-   target

### Runner

-   id
-   user_id
-   token
-   status
-   last_seen_at

### DeploymentJob

-   id
-   project_id
-   runner_id
-   status
-   logs_path

------------------------------------------------------------------------

## Runner Installation

``` bash
curl -fsSL https://deployr.io/install | sudo bash
```

-   Installs binary
-   Registers runner
-   Creates systemd service

------------------------------------------------------------------------

## CLI Commands

-   deploy login
-   deploy init
-   deploy push
-   deploy status

------------------------------------------------------------------------

## Logging

-   Logs streamed from runner to backend
-   Logs are immutable
-   Secrets must never appear in logs

------------------------------------------------------------------------

## Success Metrics

-   Active runners
-   Weekly deployments
-   Community adoption

------------------------------------------------------------------------

## Build Order

1.  Laravel backend
2.  Runner (Go)
3.  CLI (Node)
4.  First real deployment

------------------------------------------------------------------------

## Final Note

Deployr is intentionally boring, secure, and predictable. If a feature
compromises trust or simplicity, it does not belong in v1.
