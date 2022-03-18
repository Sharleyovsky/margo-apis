import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { createHash } from 'crypto'

import { getClan } from './getClan';
import { getCookie } from "./getCookie";
import { getProfile } from './getProfile';
import { getRankPage } from './getRankPage';

class Requester {
  public static async getAuthData(login: string, password: string): Promise<{ chash: string, user_id: number }> {
    try {
      const passwordHash = createHash('sha1').update(`mleczko${password}`).digest('hex')
      const { data, headers } = await axios.post(
        'https://new.margonem.pl/ajax/login',
        `l=${login}&ph=${passwordHash}&h2=&security=true`
      );

      if (data.ok !== 1) {
        throw new Error('Autoryzacja nie powiodła się!');
      }

      headers['set-cookie'] = headers['set-cookie'].splice(3, 5);

      return {
        chash: getCookie('chash', headers),
        user_id: parseInt(getCookie('user_id', headers), 10),
      };
    } catch (err) {
      throw new Error(err.toString());
    }
  }
  public instance: AxiosInstance;
  private proxyURL = '';
  constructor (config?: AxiosRequestConfig) {
    this.instance = axios.create(config);
  }
  public useAuth({user_id, chash}: {user_id: number, chash: string}) {
    const header = 'Cookie'
    this.instance.defaults.headers.common['content-type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
    this.instance.defaults.headers.common[header] = `user_id=${user_id}; chash=${chash}; hs3=${chash.substr(0,3)};`
  }
  public getClan(nick: string, world: string) {
    return getClan(nick, world, this.instance);
  }
  public getProfile(id: string | number) {
    return getProfile(id, this.instance);
  }
  public getRankPage(page: number, world: string) {
    return getRankPage(page, world, this.instance);
  }
  public useProxy(url = 'http://cors-anywhere.herokuapp.com/') {
    this.proxyURL = url;
    this.instance.interceptors.request.use((req: any) => this.proxyMiddleware(req));
  }
  private proxyMiddleware (req: AxiosRequestConfig) {
    req.url = this.proxyURL + req.url;
    req.headers['x-requested-with'] = 'axios';
    return req;
  }
}

export default Requester;
