import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import { getClan } from './getClan';
// import { getHeroId } from './getHeroId';
import { getProfile } from './getProfile';
import { getRankPage } from './getRankPage';

class Requester {
  public instance: AxiosInstance;
  constructor (config?: AxiosRequestConfig) {
    this.instance = axios.create(config);
    this.useProxy();
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
  // public getHeroId(nick: string, world: string) {
  //   return getHeroId(nick, world, this.instance);
  // }
  public useProxy() {
    this.instance.interceptors.request.use((req) => this.proxyMiddleware(req));
  }
  private proxyMiddleware (req: AxiosRequestConfig) {
    req.url = 'http://cors-anywhere.herokuapp.com/' + req.url;
    req.headers['x-requested-with'] = 'axios';
    return req;
  }
};

export default new Requester();
