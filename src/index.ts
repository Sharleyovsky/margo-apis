import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
<<<<<<< HEAD
import sha1 from 'sha1'
=======
import { createHash } from 'crypto';

import { getCookie } from './helpers/getCookie';
>>>>>>> 425036ef339fb3f79498b294b91d13c3a66a548f

import { getClan } from './getClan';
import { getProfile } from './getProfile';
import { getRankPage } from './getRankPage';
import { getHeroId } from './getHeroId';

export interface AuthData {
  chash: string;
  user_id: number;
}

export default class Requester {
  public static async getAuthData(login: string, password: string): Promise<AuthData> {
    try {
      };
    } catch (err: any) {
      throw new Error(err.toString());
    }
  }
  public instance: AxiosInstance;
  private proxyURL = '';
  constructor(config?: AxiosRequestConfig) {
    this.instance = axios.create(config);
    this.instance.interceptors.request.use((req) => this.proxyMiddleware(req));
  }
  public useAuth({ user_id, chash }: AuthData) {
    this.instance.defaults.headers.common['content-type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    this.instance.defaults.headers.common['Cookie'] = `user_id=${user_id}; chash=${chash}; hs3=${chash.substring(
      0,
      3,
    )};`;
  }
  public getClan(world: string, id: number | string) {
    return getClan(world, id, this.instance);
  }
  public getProfile(id: string | number) {
    return getProfile(id, this.instance);
  }
  public getRankPage(world: string, page: number) {
    return getRankPage(page, world, this.instance);
  }
  public getGID(world: string, nickname: string) {
    return getHeroId(nickname, world, this.instance);
  }
  public useProxy(url = 'http://cors-anywhere.herokuapp.com/') {
    this.proxyURL = url;
  }
  private proxyMiddleware(req: AxiosRequestConfig) {
    if (this.proxyURL) {
      req.url = this.proxyURL + req.url;
      req.headers = {
        ...req.headers,
        'x-requested-with': 'axios',
      };
    }
    return req;
  }
}
