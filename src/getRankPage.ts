import { AxiosInstance } from 'axios';
import { HTMLElement, parse } from 'node-html-parser';

export class RankUser {
  public userId: number;
  public world: string;
  public heroId: number;
  constructor (
    url: string,
    public position: number,
    public nick: string,
    public lvl: number,
    public prof: string,
    public honor: number,
    public lastOnline: string
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

async function fetchRankPage (page: number, world: string, instance: AxiosInstance) {
	try {
		const response = await instance.get(`https://new.margonem.pl/ladder/players,${world[0].toUpperCase() + world.slice(1).toLowerCase()}?page=${page}`);
		if (response.status !== 200) {
			throw new Error('Nie ma takiego świata');
		}
		return response.data as string;
	} catch (err) {
		if (err.response) {
			if (err.response.status !== 200) {
				throw new Error('Nie ma takiego świata');
			}
		} else {
			throw new Error(err.toString());
		}
	}
}

async function parseRankPage (body: string) {
  const root = parse(body.split('<div class="ranking-body player-ranking">')[1].split('<div class="top-player">')[0], {
    lowerCaseTagName: false,
    pre: false,
    script: false,
    style: false
  }) as HTMLElement;
  const list: RankUser[] = [];
  root.querySelectorAll('tr').forEach(($e, i) => {
    if (i === 0) {
      return;
    }
    const $a = $e.querySelector('.long-clan').querySelector('a');
    list.push(new RankUser(
      $a.getAttribute('href')!,
      parseInt($e.querySelector('.id').text.trim(), 10),
      $a.text.trim(),
      parseInt($e.querySelector('.long-level').text.trim(), 10),
      $e.querySelector('.long-players').text.trim(),
      parseInt($e.querySelector('.long-ph').text.trim(), 10),
      $e.querySelector('.long-last-online').text.trim()
    ));
  });
  return list;
}

export async function getRankPage (page: number, world: string, instance: AxiosInstance) {
	try {
    const res = await fetchRankPage(page, world, instance);
    const characters = await parseRankPage(res!);
		return characters;
	} catch (err) {
		throw new Error(err.toString());
	}
}

