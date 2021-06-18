# Margo APIS

Zbiór crawlerów do margonem.pl

## Install

```bash
npm i agysx/margo-apis
```

## Usage

```js
const Apis = require('margo-apis').default;
const apis = new Apis();

(async () => {
  const rank = await apis.getRankPage(1, 'dev');
  const clan = await apis.getClan(1, 'dev');
  const profile = await apis.getProfile(1);
})();
```
