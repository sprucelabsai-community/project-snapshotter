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

**Local Development:**
```bash
# Boot local Gitea for testing
./boot-git.sh
# Opens at http://localhost:3333
```

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

## Next Steps / Open Questions

### Jest Reporter (`@regressionproof/jest-reporter`)

**Status:** Package scaffolded with reporter skeleton

**Done:**
- [x] Package setup (ESM, workspace integrated)
- [x] Reporter class with Jest hooks (`onRunStart`, `onTestStart`, `onRunComplete`)

**TODO:**
- [ ] Transform Jest `AggregatedResult` → our `TestResults` format
- [ ] Load config from `.regressionproof.json`
- [ ] Call snapshotter in `onRunComplete`
- [ ] Graceful error handling (don't crash test runs)

**Usage (once complete):**
```javascript
// jest.config.js
module.exports = {
  reporters: ['default', '@regressionproof/jest-reporter']
}
```

### CLI Init Flow

The `regressionproof init` command needs to:

1. **Register project** - Call API to create repo and get credentials (partially done - name checking works)
2. **Store credentials** - Save to `~/.regressionproof/<project-hash>/config.json`
3. **Auto-configure Jest** - Add reporter to `package.json` or `jest.config.ts`

### Config & Mirror Location

All RegressionProof data lives in the user's home directory:

```
~/.regressionproof/
  <project-hash>/
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

**Project hash:** Based on project path or git remote URL (TBD)

### Decisions

- **Config/mirror in home directory** - `~/.regressionproof/<project-hash>/` keeps project clean, survives clones, avoids credential leaks
- **Auto-modify jest config** - `regressionproof init` will automatically add the reporter:
  1. Check `package.json` for `jest.reporters` first (Spruce CLI style)
  2. Fallback to `jest.config.ts`
- **Jest-only for now** - Ship Jest reporter first, but future vision includes other test frameworks (Vitest, Mocha) and other languages

### Progress Tracker

- [x] `@regressionproof/snapshotter` - Core snapshot library
- [x] `@regressionproof/api` - Project registration API
- [x] `@regressionproof/client` - API client
- [x] `@regressionproof/cli` - CLI (init partially done)
- [ ] `@regressionproof/jest-reporter` - Jest integration (in progress)
