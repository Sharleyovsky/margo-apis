import { AxiosInstance } from 'axios';
import { HTMLElement, parse } from 'node-html-parser';

export class MemberInfo {
    constructor(public gid: string, public id: string, public nick: string) {}
}

async function fetchClan(world: string, id: number | string, instance: AxiosInstance) {
    try {
        const response = await instance.get(`http://new.margonem.pl/guilds/view,${world},${id}`, {
            headers: {
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7,fr;q=0.6,de;q=0.5'
            }
        });
        if (response.status !== 200) {
            throw new Error('Brak klanu');
        }
        return response.data as string;
    } catch (err) {
        if (err.response) {
            if (err.response.status !== 200) {
                throw new Error('Brak klanu');
            }
        } else {
            throw new Error(err.toString());
        }
    }
}

function parseClanPage (body: string) {
    const root = parse(body.split('<table>')[1].split('</table>')[0], {
        lowerCaseTagName: false,
        pre: false,
        script: false,
        style: false
    }) as HTMLElement;
    const list: MemberInfo[] = [];
    root.querySelectorAll('.nick.table-borders').forEach(($e, idx) => {
        if(!idx) {
            return;
        }
        const helper = $e.querySelector('a').getAttribute('href')!.match(/\d+/g)!;
        const member = new MemberInfo(helper[0], helper[1], $e.text.trim())
        list.push(member);
    });
    return {
        members: list
    }
}

export async function getClan (world: string, id: number | string, instance: AxiosInstance){
    try {
        const res = await fetchClan(world, id, instance);
        return parseClanPage(res!);
    } catch (err) {
        throw new Error(err.toString());
    }
}
