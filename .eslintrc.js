module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['@pitcher/eslint-config/javascript', 'prettier'],
  parserOptions: {
    parser: 'babel-eslint',
  },
  ignorePatterns: ['public/translations/**/*.json'],
}
