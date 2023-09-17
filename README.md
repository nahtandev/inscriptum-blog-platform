# Inscriptum Blog Platform

Inscriptum is an open-source blog where anyone can come and share content.

This Github repository contains the entire code base of the project.

## Commit Message Guidelines 

**Commit Message Format**

Each commit message consists of a header, a body and a footer. The header has a special format that includes a type, a scope and a subject:

```
<type>[optional scope]: <description>

[optional body]

[optional footer]

```

The `header` is mandatory and the scope of the header is optional.

Any line of the commit message cannot be longer 150 characters! This allows the message to be easier to read on GitHub as well as in various git tools.

**Type**

Must be one of the following:

- `feat`: Features -> A new feature
- `fix`: Bug Fixes -> A bug fix
- `refactor`: Code Refactoring -> A code change that neither fixes a bug nor adds a feature
- `test`: Tests -> Adding missing tests or correcting existing tests
- `build`: Builds -> Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
- `chore`: Chores -> Other changes that don't modify src or test files
- `ci`: Continuous Integrations -> 
Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
- `docs`: Documentation -> Documentation only changes
- `perf`: Performance Improvements -> A code change that improves performance
- `revert`: Reverts -> Reverts a previous commit
- `style`: Styles -> Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `config`: this type is not included in conventional validation guidelines. It is added to name all code updates that affect the configuration of a project

**Scope**

The scope should be the name of the npm package affected. The following is the list of supported scopes:

- dashboard
- public-site
- common-utilities
- api

**Subject**

The subject contains a succinct description of the change. 
- Specify the github issue number in the subject.
- Specify `(wip)` at end of subject when the commit is not the last one before a pull request.


**Example**

- `config: [#2] setup conventional commit (wip)`
- `feat(dashboard): [#1] setup next app`

See https://www.conventionalcommits.org/fr/v1.0.0/ to read more. 