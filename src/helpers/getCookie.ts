import { AxiosRequestHeaders } from 'axios';

type Headers = NonNullable<AxiosRequestHeaders>;
export const getCookie = (name: string, headers: Headers) => {
  const rawCookies = headers['set-cookie'] as unknown as Headers[string][];
  for (const cookie of rawCookies.map(String).reverse()) {
    // reverse() -> https://github.com/Agysx/margo-apis/pull/9
    if (!cookie.includes(name)) {
      continue;
    }
    return cookie.split(';')[0].split('=')[1];
  }
};
