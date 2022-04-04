import { AxiosInstance } from 'axios';
import { stringify } from 'qs';

import { getRankPage } from './getRankPage';

async function searchInRank(nick: string, world: string, instance: AxiosInstance) {
	try {
		const response = await instance.post(`https://new.margonem.pl/ajax/playerpos`, stringify({
			n: nick,
			s: world
		}), {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		});
		if (response.status !== 200) {
			throw new Error('Nie ma takiego świata');
		}
		if (typeof response.data !== 'object') {
			throw new Error('Nieoczekiwany błąd, response.data !== object')
		}
		if (response.data.ok !== 1) {
			if (response.data.msg === 'This character cannot be found') {
				throw new Error('Brak gracza');
			}
			throw new Error(response.data.msg);
		}
		const exec = /\/ladder\/players,([a-z]+),(\d+),(\d+)/.exec(response.data.url)!;
		return {
			nick,
			page: parseInt(exec[2], 10),
			position: parseInt(exec[3], 10),
			world: exec[1]
		}
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

export async function getHeroId(nick: string, world: string, instance: AxiosInstance) {
	try {
		const rdata = await searchInRank(nick, world, instance);
		if (!rdata) {
			throw new Error('Cannot download data');
		}
		const { page, position } = rdata;
		const diff = -1;
		const rankCharacters = await getRankPage(page + diff, world, instance);
		const character = rankCharacters.find((data) => data.nick.toLowerCase() === nick.toLowerCase());
		return character;
	} catch (err) {
		throw new Error(err.toString());
	}
}
// Not working propertly
