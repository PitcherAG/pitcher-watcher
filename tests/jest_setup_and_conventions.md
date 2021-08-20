<Meta title="How Tos/Setup Jest on a Pitcher Vue(v2) app - Pitcher's Unit test conventions" />

## Setup Jest on a Pitcher Vue(v2) app

**Important! This guide is created with mid/large projects in mind, where views/components and unit-tests are contained in the same folder)**

<pre><code>
├─ views/
│  │
│  ├── home
│  │   ├── home.view.router.js 
│  │   ├── home.view.spec.js
│  │   ├── home.view.spec.js.snap
│  │   └── home.view.vue
│  ├── login
│  │   ├── login.view.router.js 
│  │   ├── login.view.spec.js
│  │   ├── login.view.spec.js.snap
│  │   └── login.view.vue
│  │   
│  └── etc.

</code></pre>

**Note: All below configuration steps are already implemented in vue-project-template. There is no need to do anything**

1. Install cli-plugin-unit-jest plugin (https://cli.vuejs.org/)

   - using `npx @vue/cli add unit-jest`

   - or if you already have vue-cli installed `vue add unit-jest`

2. Delete sample test suite (test folder)

3. Install Vue Test Utils (https://cli.vuejs.org/)

   - `npm install --save-dev @vue/test-utils`

4. Override jest.config.js (https://jestjs.io/docs/en/configuration)

5. Create `tests/` folder (config folder can be used for other configurations too)

6. Create `tests/config/jest.setup.js` (https://jestjs.io/docs/en/configuration#setupfilesafterenv-array)

7. Create `tests/config/jest.snapshotResolver.js` (https://jestjs.io/docs/en/configuration#snapshotresolver-string)

8. Create `tests/config/jest.setEnvVars.js` (https://jestjs.io/docs/en/configuration#setupfiles-array)

9. Override `overrides:files` in .eslintrc.js with `files: ['**/*.spec.{j,t}s?(x)']`

10. Create npm run command for unit testing with coverage support (under `test:unit`)

    - `"test:unit-coverage": "vue-cli-service test:unit --coverage",`

11. Enable Github action in .github/workflows/main.yml if needed.

```javascript
- name: unittest
        run: npm run test:unit-coverage
      - name: Coveralls GitHub Action
        uses: coverallsapp/github-action@v1.1.2
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

12. Add to .gitignore

```
# unit-test
coverage/
```

## Pitcher's Unit test conventions

> Folder structure/naming conventions

- Name test files as spec (specification)  
  e.g `mycomp.spec.js` instead of `mycomp.test.js`
- Unit tests at the same folder with the component (with no test folder)
- Snapshot files at the same folder with the component (with no snapshot folder)

> Coding

- Group tests under describe blocks. Highest scope describe block description should be the component/view name

```javascript
describe('myComponentName', () => {...
          or
describe('myViewName', () => {...
```

- Use `it` instead of `test` and compose test names accordingly

```javascript
it('should do this thing', () => {})
vs
test('if it does this thing', () => {})
```

- At least one snapshot per component
- Snapshot should be grouped into separated describe block with name = rendering

```javascript
describe('rendering', () => {
```
