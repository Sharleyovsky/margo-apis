import { AxiosInstance } from 'axios';
import { HTMLElement, parse } from 'node-html-parser';
import { safeCallFactory } from './helpers/safeCallFactory';

const safeCall = safeCallFactory('[MargoAPIS] [ClanPage] Invalid selector');

export class MemberInfo {
  constructor(public gid: string, public id: string, public nick: string) {}
}

async function fetchClan(world: string, id: number | string, instance: AxiosInstance) {
  try {
    const response = await instance.get(`http://www.margonem.pl/guilds/view,${world},${id}`);
    if (response.status !== 200) {
      throw new Error('Brak klanu');
    }
    return response.data as string;
  } catch (err: any) {
    if (err.response) {
      if (err.response.status !== 200) {
        throw new Error('Brak klanu');
      }
    } else {
      throw new Error(err.toString());
    }
  }
}

function parseClanPage(body: string) {
  const root = parse(body.split('<body>')[1].split('</body>')[0], {
    lowerCaseTagName: false,
    blockTextElements: {
      pre: false,
      script: false,
      style: false,
    },
  }) as HTMLElement;
  const list: MemberInfo[] = [];
  safeCall(root.querySelector.bind(root), '.guild-members-container')
    .querySelectorAll('.nick.table-borders')
    .forEach(($e, idx) => {
      if (!idx) {
        return;
      }
      const helper = (safeCall($e.querySelector.bind($e), 'a').getAttribute('href') ?? '').match(/\d+/g) || [];
      const member = new MemberInfo(helper[0], helper[1], $e.text.trim());
      list.push(member);
    });
  return {
    members: list,
  };
}

export async function getClan(world: string, id: number | string, instance: AxiosInstance) {
  try {
    const res = await fetchClan(world, id, instance);
    if (res === undefined) throw new Error('Fetch clan page failed');
    return parseClanPage(res);
  } catch (err: any) {
    throw new Error(err.toString());
  }
}
