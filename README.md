# Project Snapshotter

## Purpose / Vision

A TypeScript tool for capturing code evolution through the TDD cycle, with the ultimate goal of generating training data for LLMs (possibly for fine-tuning).

### Core Concept

- Integrates with test runners via reporters/plugins (Jest, Vitest, etc.)
- Triggered automatically after each test run
- Syncs source code to an isolated mirror directory
- Commits code + test metadata together, building a git history of TDD progression
- This history becomes training data for LLMs

### Key Advantage

Test runner reporters give us direct access to test results in a structured format, making integration straightforward across different frameworks.

## Architecture Decisions

### What is a "Snapshot"?

A snapshot is:

1. **Sync source files** to a mirror directory using rsync
   - If source has `.gitignore`: use `git ls-files` to respect it, plus security exclusions
   - If no `.gitignore`: use security exclusions only
   - See [Security / Privacy](#security--privacy) for exclusion list

2. **Git commit** in the mirror directory's own isolated repo
   - Captures the diff from previous state
   - Full history preserved for reconstruction
   - Completely isolated from the developer's repo/workflow

3. **Include test results** in the commit (at `.snapshotter/testResults.json`)
   - Each commit contains both code state AND test results
   - Enables correlation when extracting training data later
   - See [Test Results Format](#test-results-format) for schema

4. **Push to remote** Gitea instance
   - See [Git Hosting & Remote Push](#git-hosting--remote-push) for details

### How Do We Trigger Snapshots?

Test runner integrations (e.g., Jest reporter) call `snapshot()` directly after each completed test run. No watcher/daemon needed - simpler and more reliable.

**Flow:**
1. Test run completes
2. Reporter collects test results
3. Reporter calls `await snapshot({ testResults, ... })` (see [API](#api))
4. Snapshotter syncs source files to mirror directory
5. Snapshotter writes test results to mirror (at `.snapshotter/testResults.json`)
6. Snapshotter commits everything together
7. Snapshotter pushes to remote Gitea
8. Function returns

- **Frequency**: Every completed test run
- **Deduplication**: Handled naturally by git - if no code changed since last snapshot, nothing to commit

This is a clean separation of concerns:
- **Reporter**: knows about tests, collects results, calls snapshot()
- **Snapshotter**: handles syncing, committing, history management

### Git Hosting & Remote Push

Snapshots are pushed to a self-hosted **Gitea** instance after each commit. This gives us full control over authentication and makes training data collection easy.

**Why Gitea:**
- Lightweight, easy to deploy (single binary or Docker)
- Full API for creating repos and tokens
- Self-hosted = full control, no third-party dependencies
- All training data in one place under one admin account

**Architecture:**

```
Developer's machine                Our infrastructure
┌──────────────────────┐          ┌─────────────────┐
│  regressionproof     │          │  Snapshot API   │
│  init (CLI)          │ ──────── │  (creates repos │
│    ↓                 │ ←─────── │   and tokens)   │
│  (saves credentials) │          └────────┬────────┘
│                      │                   │
│  Test Runner         │          ┌────────▼────────┐
│  + Reporter          │ ───────→ │     Gitea       │
│    ↓                 │          │  (self-hosted)  │
│  Snapshotter → Push  │          └─────────────────┘
└──────────────────────┘
```

**Snapshot API**:
- Hosted alongside Gitea
- Holds the Gitea admin token securely (never exposed to developers)
- `regressionproof init` CLI calls it to register a project
- Creates a repo under the admin account
- Generates a scoped token for that repo
- Returns `{ url, token }` which are saved locally

**Flow:**
1. Developer runs `regressionproof init` → registers project → credentials saved locally
2. Test runner reporter reads credentials and passes to snapshotter
3. After each snapshot commit, snapshotter pushes to Gitea
4. All repos live under admin account for easy training data access

**Note:** This library only handles snapshotting and pushing. The CLI handles registration and the reporter handles triggering snapshots.

**Local Development:** See [Local Development](#local-development) section for setup instructions.

### Test Results Format

Test results are passed by the test runner reporter as an object on every completed test run. The snapshotter writes them to `.snapshotter/testResults.json` in the mirror directory and commits alongside the code, so each commit has both the code state and the test results that triggered it.

#### Schema

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | string | ISO 8601 timestamp of when test run completed |
| `summary.totalSuites` | number | Total number of test suites (files) |
| `summary.passedSuites` | number | Number of suites with all tests passing |
| `summary.failedSuites` | number | Number of suites with at least one failure |
| `summary.totalTests` | number | Total number of individual tests |
| `summary.passedTests` | number | Number of passing tests |
| `summary.failedTests` | number | Number of failing tests |
| `suites` | array | Array of suite objects |
| `suites[].path` | string | Path to test file, **relative to project root** |
| `suites[].passed` | boolean | Whether all tests in suite passed |
| `suites[].tests` | array | Array of test objects |
| `suites[].tests[].name` | string | Name of the individual test |
| `suites[].tests[].passed` | boolean | Whether this test passed |
| `suites[].tests[].error` | string | Full error message + callstack (only present if failed). Paths in callstack should also be relative to project root. |

#### Example

```json
{
  "timestamp": "2025-01-15T10:30:00Z",
  "summary": {
    "totalSuites": 5,
    "passedSuites": 4,
    "failedSuites": 1,
    "totalTests": 42,
    "passedTests": 41,
    "failedTests": 1
  },
  "suites": [
    {
      "path": "src/__tests__/UserService.test.ts",
      "passed": false,
      "tests": [
        {
          "name": "should create a user",
          "passed": true
        },
        {
          "name": "should validate email",
          "passed": false,
          "error": "Expected true but got false\n    at Object.<anonymous> (src/__tests__/UserService.test.ts:45:10)\n    at Promise.then.completed (node_modules/jest-circus/build/utils.js:293:28)"
        }
      ]
    },
    {
      "path": "src/__tests__/AuthController.test.ts",
      "passed": true,
      "tests": [
        {
          "name": "should authenticate user",
          "passed": true
        },
        {
          "name": "should reject invalid token",
          "passed": true
        }
      ]
    }
  ]
}
```

## Usage

### Installation

```bash
yarn add project-snapshotter
```

### API

```typescript
import { snapshot } from 'project-snapshotter'

await snapshot({
  sourcePath: '/path/to/project',  // optional, defaults to process.cwd()
  mirrorPath: '/path/to/mirror',   // required
  testResults: {                    // required - see Test Results Format for schema
    timestamp: new Date().toISOString(),
    summary: {
      totalSuites: 1,
      passedSuites: 1,
      failedSuites: 0,
      totalTests: 2,
      passedTests: 2,
      failedTests: 0
    },
    suites: [
      {
        path: 'src/__tests__/Example.test.ts',
        passed: true,
        tests: [
          { name: 'should work', passed: true },
          { name: 'should also work', passed: true }
        ]
      }
    ]
  },
  remote: {
    url: 'http://localhost:3333/admin/my-project.git',
    token: 'gitea-token-here'
  }
})
```

### Options

| Option | Required | Default | Description |
|--------|----------|---------|-------------|
| `sourcePath` | No | `process.cwd()` | Source project path to sync from |
| `mirrorPath` | Yes | - | Mirror directory path (where the isolated git repo lives) |
| `testResults` | Yes | - | Test results object (see [Test Results Format](#test-results-format) for schema) |
| `remote.url` | Yes | - | Gitea repo URL to push to |
| `remote.token` | Yes | - | Gitea access token for authentication |

### What Happens

1. Syncs source files to mirror directory (see [Security / Privacy](#security--privacy) for exclusions)
2. Writes test results to `.snapshotter/testResults.json` in mirror
3. Commits all changes to the mirror's git repo
4. Pushes to remote Gitea repo
5. If no changes since last snapshot, no commit/push is made

## Security / Privacy

Snapshots are intended to become LLM training data, so we take care to avoid capturing sensitive information.

### File Exclusions

1. **Honor `.gitignore`** - If the source project has a `.gitignore`, we respect it via `git ls-files`

2. **Default exclusions** - These patterns are always excluded, regardless of `.gitignore`:
   - `node_modules` - Dependencies
   - `build` - Build artifacts
   - `*.env*` - Environment files
   - `*.pem` - Certificates
   - `*.key` - Private keys
   - `*.p12` - PKCS12 keystores
   - `*.pfx` - PKCS12 keystores
   - `*credentials*` - Credential files
   - `*secret*` - Secret files
   - `*.local` - Local config overrides

### Developer Responsibility

The developer is ultimately responsible for:
- Maintaining a proper `.gitignore`
- Not hardcoding secrets in source files
- Reviewing what gets captured if working with sensitive data

## Local Development

### Prerequisites

- Docker running
- Node.js 18+
- Yarn

### Scripts

| Script | Description |
|--------|-------------|
| `yarn dev` | Boot Gitea + API (for developing on regressionproof) |
| `yarn setup.e2e` | Build + Gitea + link packages + API (for testing in other projects) |
| `yarn build` | Build all packages |
| `yarn test` | Run all tests |
| `yarn watch` | Watch mode for all packages |

### E2E Testing with Local Projects

To test regressionproof against your own local projects:

**Terminal 1** (this repo):
```bash
yarn setup.e2e
# Builds, boots Gitea, links packages, starts API
# Leave running - Ctrl+C to stop
```

**Terminal 2** (your test project):
```bash
yarn link @regressionproof/cli @regressionproof/jest-reporter
printf '\nREGRESSIONPROOF_API_URL=http://localhost:3000\n' >> .env
node node_modules/@regressionproof/cli/build/cli.js init
yarn test
```

Then check http://localhost:3333 for your snapshot.

**Credentials:** admin / devpassword123

### Script Details

- **`scripts/boot-infra.sh`** - Boots Gitea container, creates admin user, writes .env files
- **`scripts/boot-api.sh`** - Calls boot-infra.sh + starts API
- **`scripts/e2e-setup.sh`** - Build + boot-infra + yarn link + starts API

All scripts are reentrant (safe to run multiple times). Ctrl+C to stop.

### Environment Variables

Override defaults by setting these before running scripts:

| Variable | Default | Description |
|----------|---------|-------------|
| `GITEA_PORT` | `3333` | Gitea HTTP port |
| `API_PORT` | `3000` | API server port |
| `ADMIN_USER` | `admin` | Gitea admin username |
| `ADMIN_PASSWORD` | `devpassword123` | Gitea admin password |
| `CONTAINER_NAME` | `regressionproof-gitea-dev` | Docker container name |

Example:
```bash
GITEA_PORT=4000 API_PORT=4001 yarn setup.e2e
```

### Stopping Gitea

```bash
docker stop regressionproof-gitea-dev

# Full cleanup (removes data)
docker rm regressionproof-gitea-dev
```

## Implementation Status

All core packages are complete and tested.

### Progress Tracker

- [x] `@regressionproof/snapshotter` - Core snapshot library
- [x] `@regressionproof/api` - Project registration API
- [x] `@regressionproof/client` - API client
- [x] `@regressionproof/cli` - CLI with full init flow
- [x] `@regressionproof/jest-reporter` - Jest integration

### Jest Reporter (`@regressionproof/jest-reporter`)

**Status:** Complete

- [x] Package setup (ESM, workspace integrated)
- [x] Reporter class with Jest hooks (`onRunStart`, `onTestStart`, `onRunComplete`)
- [x] Transform Jest `AggregatedResult` → our `TestResults` format
- [x] Load config from `.regressionproof.json` or git remote
- [x] Call snapshotter in `onRunComplete`
- [x] Graceful error handling (logs instead of crashing test runs)

**Usage:**
```javascript
// jest.config.js
module.exports = {
  reporters: ['default', '@regressionproof/jest-reporter']
}
```

### CLI Init Flow

**Status:** Complete

The `regressionproof init` command:
1. **Registers project** - Calls API to create Gitea repo and get credentials
2. **Stores credentials** - Saves to `~/.regressionproof/<project-name>/config.json`
3. **Auto-configures Jest** - Adds reporter to `package.json`, `jest.config.ts`, or `jest.config.js`

### Config & Mirror Location

All RegressionProof data lives in the user's home directory:

```
~/.regressionproof/
  <project-name>/
    config.json    # credentials + settings
    mirror/        # git mirror (isolated repo)
```

**Why home directory?**
- Keeps project directory clean (no `.regressionproof/` folder)
- Survives across project clones
- No gitignore needed
- Credentials not accidentally committed

**config.json format:**

```json
{
  "remote": {
    "url": "http://gitea.example.com/admin/my-project.git",
    "token": "scoped-token-here"
  }
}
```

### Architecture Decisions

- **Config/mirror in home directory** - `~/.regressionproof/<project-name>/` keeps project clean, survives clones, avoids credential leaks
- **Auto-modify jest config** - `regressionproof init` automatically adds the reporter (tries package.json first, then jest.config.ts/js)
- **Project name from git remote** - Extracts repo name from `git remote get-url origin`, converts to slug

## Next Steps / Future Work

- [ ] **Vitest reporter** - Expand to other test frameworks
- [ ] **Mocha reporter** - Additional framework support
- [ ] **Other languages** - Python, Go, etc.
- [ ] **Dashboard/analytics** - Visualize TDD progression data
- [ ] **Training data extraction** - Tools to process git history into LLM training format
