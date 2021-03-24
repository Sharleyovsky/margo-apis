import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import { getClan } from './getClan';
import { getProfile } from './getProfile';
import { getRankPage } from './getRankPage';

class Requester {
  private proxyURL = '';
  public instance: AxiosInstance;
  constructor (config?: AxiosRequestConfig) {
    this.instance = axios.create(config);
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
};

export default new Requester();
