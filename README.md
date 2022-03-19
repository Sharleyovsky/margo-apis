# Margo APIS

Zbiór crawlerów do margonem.pl

## Install

```bash
npm i agysx/margo-apis
```

## Usage

```js
// const MargoAPI = require('margo-apis').default;
import MargoAPI from 'margo-apis';
const api = new MargoAPI();

(async () => {
  const { chash, user_id } = await MargoAPI.getAuthData('login', 'password');
  api.useAuth({ chash, user_id });
  api.useProxy();
  const profile = await api.getProfile(1);
  const rank = await api.getRankPage('classic', 1);
  const clan = await api.getClan('classic', 3);
})();
```
