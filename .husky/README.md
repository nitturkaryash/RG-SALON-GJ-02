# Husky Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) to enforce code quality through Git hooks.

## Hooks Setup

### 1. **pre-commit**
Runs on every commit before the commit is created.
- **Action**: Runs `lint-staged` to:
  - Auto-fix ESLint issues in staged `.ts`, `.tsx`, `.js`, `.jsx` files
  - Format staged files with Prettier
- **Purpose**: Ensures only clean, formatted code is committed

### 2. **pre-push**
Runs before pushing to remote repository.
- **Action**: 
  - Runs full lint check across the codebase
  - Verifies code formatting with Prettier
- **Purpose**: Prevents pushing code with linting or formatting issues

### 3. **commit-msg**
Validates commit messages.
- **Action**: Checks that commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) format
- **Format**: `type(scope?): description`
- **Valid types**:
  - `feat`: New feature
  - `fix`: Bug fix
  - `docs`: Documentation changes
  - `style`: Code style changes (formatting, semicolons, etc.)
  - `refactor`: Code refactoring
  - `perf`: Performance improvements
  - `test`: Adding or updating tests
  - `build`: Build system or dependency changes
  - `ci`: CI/CD changes
  - `chore`: Other changes (tooling, configs, etc.)
  - `revert`: Revert previous commit

## Examples

### ✅ Valid Commit Messages
```bash
git commit -m "feat: add user authentication"
git commit -m "fix: resolve stock calculation bug"
git commit -m "docs: update API documentation"
git commit -m "refactor(pos): simplify order creation logic"
git commit -m "perf: optimize database queries"
```

### ❌ Invalid Commit Messages
```bash
git commit -m "updated files"
git commit -m "bug fix"
git commit -m "WIP"
```

## Bypassing Hooks (Not Recommended)

In exceptional cases, you can bypass hooks:

```bash
# Skip pre-commit and commit-msg hooks
git commit --no-verify -m "emergency fix"

# Skip pre-push hook
git push --no-verify
```

⚠️ **Warning**: Only use `--no-verify` in emergencies. The hooks are there to maintain code quality!

## Troubleshooting

### Hook not executing
Make sure hooks are executable:
```bash
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
chmod +x .husky/commit-msg
```

### Linting errors
Run the fix command:
```bash
npm run lint:fix
npm run format
```

### Manual checks
You can manually run the same checks:
```bash
# Run lint-staged manually
npx lint-staged

# Run full lint
npm run lint

# Format all files
npm run format

# Check formatting
npm run format:check
```

