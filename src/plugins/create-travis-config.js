

// TODO add in amplify hosting variables?? maybe even use react-deploy for now
export const createTravisConfig = (store)=> `language: node_js
cache:
  directories:
    - ~/.npm

notifications:
  email: false

env:
  global:
    - GH_TOKEN=${store.answers.gitAccessToken}

node_js:
  - '10'

install: npm ci


jobs:
  include:
    - stage: test
      script: npx run clean test build
    - stage: deploy
      if: branch = master
      script: deploy
`;
