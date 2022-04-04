import { AxiosInstance } from 'axios';
import { HTMLElement, parse } from 'node-html-parser';
import { safeCallFactory } from './helpers/safeCallFactory';

const safeCall = safeCallFactory('[MargoAPIS] [RankPage] Invalid selector');

export class RankUser {
  public userId: number;
  public world: string;
  public heroId: number;
  constructor(
    url: string,
    public position: number,
    public nick: string,
    public lvl: number,
    public prof: string,
    public honor: number,
    public lastOnline: string,
  ) {
    const exec = /^\/profile\/view,(\d+)#char_(\d+),([a-z]+)$/.exec(url);
    if (exec === null) {
      throw new Error('Error while parsing profile');
    }
    this.userId = parseInt(exec[1], 10);
    this.heroId = parseInt(exec[2], 10);
    this.world = exec[3];
  }
}

async function fetchRankPage(page: number, world: string, instance: AxiosInstance) {
  try {
    const response = await instance.get(
      `https://www.margonem.pl/ladder/players,${world[0].toUpperCase() + world.slice(1).toLowerCase()}?page=${page}`,
    );
    if (response.status !== 200) {
      throw new Error('Nie ma takiego świata');
    }
    return response.data as string;
  } catch (err: any) {
    if (err.response) {
      if (err.response.status !== 200) {
        throw new Error('Nie ma takiego świata');
      }
    } else {
      throw new Error(err.toString());
    }
  }
}

async function parseRankPage(body: string) {
  const root = parse(body.split('<div class="ranking-body player-ranking">')[1].split('<div class="top-player">')[0], {
    lowerCaseTagName: false,
    blockTextElements: {
      pre: false,
      script: false,
      style: false,
    },
  }) as HTMLElement;
  const list: RankUser[] = [];
  root.querySelectorAll('tr').forEach(($e, i) => {
    if (i === 0) {
      return;
    }
    const $longClan = safeCall($e.querySelector.bind($e), '.long-clan');
    const $a = safeCall($longClan.querySelector.bind($longClan), 'a');

    list.push(
      new RankUser(
        $a.getAttribute('href') ?? '',
        parseInt(safeCall($e.querySelector.bind($e), '.id').text.trim(), 10),
        $a.text.trim(),
        parseInt(safeCall($e.querySelector.bind($e), '.long-level').text.trim(), 10),
        safeCall($e.querySelector.bind($e), '.long-players').text.trim(),
        parseInt(safeCall($e.querySelector.bind($e), '.long-ph').text.trim(), 10),
        safeCall($e.querySelector.bind($e), '.long-last-online').text.trim(),
      ),
    );
  });
  return list;
}

export async function getRankPage(page: number, world: string, instance: AxiosInstance) {
  try {
    const res = await fetchRankPage(page, world, instance);
    if (res === undefined) throw new Error('Fetch rank page failed');
    const characters = await parseRankPage(res);
    return characters;
  } catch (err: any) {
    throw new Error(err.toString());
  }
}
