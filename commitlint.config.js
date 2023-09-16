/**
 * @see https://github.com/conventional-changelog/commitlint/blob/master/docs/reference-rules.md
 */
module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'header-min-length': [
            2,
            'always',
            10
        ],
        'header-max-length': [
            2,
            'always',
            200
        ],
        'type-enum': [
            2,
            'always',
            [
                'build',
                'chore',
                'ci',
                'docs',
                'feat',
                'fix',
                'perf',
                'refactor',
                'revert',
                'style',
                'test',
                'config'
            ]
        ],
        'scope-enum': [
            2,
            'always',
            [
                'dashboard',
                'public-site',
                'common-utilities',
                'api'
            ]
        ],
    }
}