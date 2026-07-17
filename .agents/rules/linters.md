---
trigger: always_on
description: Always use local linters to format code automatically.
---

## Linters and Code Formatting

To avoid wasting AI tokens on manual code formatting, indentation, or fixing basic stylistic issues:
- ALWAYS run the project's local formatter or linter via the terminal instead of manually making stylistic file edits.
- For Python, use `uvx ruff check --fix .` or `uvx ruff format .`
- For JavaScript/TypeScript/Web, use `npx @biomejs/biome format --write .` or `npx prettier --write .`
- Do not edit files just to fix spacing or tabs.
