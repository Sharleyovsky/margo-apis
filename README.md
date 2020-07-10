# Margo APIS

Zbiór crawlerów do margonem.pl

## Install

```bash
npm i agysx/margo-apis
```

## Usage

```js
const apis = require('margo-apis').default;

const rank = apis.getRankPage(1, 'dev');
const clan = apis.getClan(1, 'dev');
const profile = apis.getProfile(1, 'dev');
```
