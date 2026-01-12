# Claude Code SOP

## Coding Workflow

1. **Outline a plan** - Present each step with a concise description and code samples
2. **Get approval** - Wait for approval before starting; go through each step one at a time to allow for edits
3. **Detail the step** - Before executing, present the step in full detail (complete code, file paths, rationale) for review and approval
4. **Execute** - Implement the approved step, then present the next step in detail and repeat

## Commit Message Convention

Commit messages must follow semver intent for CI/CD:

- `patch: {detailed description of changes}` for immaterial behavior changes
- `minor: {detailed description of changes}` for new features
- `major: {detailed description of changes}` for breaking changes
