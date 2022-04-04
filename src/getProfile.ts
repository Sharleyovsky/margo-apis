import { AxiosInstance } from 'axios';
import { HTMLElement, Node, parse, TextNode } from 'node-html-parser';
import { safeCallFactory } from './helpers/safeCallFactory';

const safeCall = safeCallFactory('[MargoAPIS] [ProfilePage] Invalid selector');

export interface IDeputy {
  id: number;
  nick: string;
}

export interface IGuild {
  id: number;
  name: string;
  isLeader: boolean;
}

export class ProfileInfo {
  constructor(
    public nick: string,
    public outfit: string,
    public rank: string,
    public last: Date,
    public forumPosts: number,
    public accountCreationDate: Date,
    public reputation: number,
    public visits: number,
    public daysInGame: number,
    public reputationRatio: number,
    public deputy: IDeputy | null,
  ) {}
}

export class ProfileCharacter {
  constructor(
    public id: number,
    public nick: string,
    public gender: string,
    public lvl: number,
    public prof: string,
    public world: string,
    public outfitUrl: string,
    public guild: IGuild | null,
    public last: Date,
  ) {}
}

export class ProfileData {
  private body: string;
  constructor(body: string, public profileInfo: ProfileInfo, public characters: ProfileCharacter[]) {
    if (body.includes('<div class="profile-custom-page-body">')) {
      const unparsed = body.split('<div class="profile-custom-page-body">')[1].split('<footer >')[0];
      this.body = unparsed.replace(/^[\n\s]*/, '').replace(/[\n\s]*(<\/div>[\n\s]*){8}$/, '');
    } else {
      this.body = '';
    }
  }
  public includes(match: string) {
    return this.body.includes(match);
  }
  public getUserPage(compile = true) {
    if (!compile) {
      return this.body;
    }
    const replaced = this.body
      .replace(/\\u([\d\w]{4})/gi, (_, grp) => String.fromCharCode(parseInt(grp, 16)))
      .replace(/<BR>/gi, '\n')
      .replace(/<center>/gi, '[center]')
      .replace(/<\/center>/gi, '[/center]')
      .replace(/<blockquote>/gi, '[cytat]')
      .replace(/<\/blockquote>/gi, '[/cytat]')
      .replace(/<i>/gi, '[i]')
      .replace(/<\/i>/gi, '[/i]')
      .replace(/<b>/gi, '[b]')
      .replace(/<\/b>/gi, '[/b]')
      .replace(/<u>/gi, '[u]')
      .replace(/<\/u>/gi, '[/u]')
      .replace(/<code>/gi, '[code]')
      .replace(/<\/code>/gi, '[/code]')
      .replace(
        /<div class=itemborder><IMG src='http:\/\/www\.margonem\.pl\/obrazki\/npc\/mas\/nic32x32\.gif'><\/div>/gi,
        'ITEM#0',
      )
      .replace(
        /<div class="itemborder"><div class="margoitem highlight[^"]*"><img src="[^"]*" tip='{"hid":"(\d+)",[^}]+}' ctip="item"><\/div><\/div>/gis,
        'ITEM#$1',
      )
      .replace(/<img src=http(s?)([^>]*)>/g, 'img$2')
      .replace(/<a href="([^"]*)" target="_blank" rel="noopener noreferrer">(.*)<\/a>/gi, '$1');
    const root = parse(replaced) as HTMLElement;
    const destruct = (element: Node): string => {
      if (element instanceof TextNode) {
        return element.rawText;
      }
      if (element instanceof HTMLElement) {
        const style = element.getAttribute('style') || '';
        const destructedChilds = element.childNodes.map((node) => destruct(node)).join('');
        if (/^font-size:(\d+)px$/.test(style)) {
          return `[size=${RegExp.$1}]${destructedChilds}[/size]`;
        }
        if (/^color:(\w+)$/.test(style)) {
          return `[color=${RegExp.$1}]${destructedChilds}[/size]`;
        }
        return destructedChilds;
      }
      return element.toString();
    };
    return destruct(root);
  }
}

// Helpers

function toNumber(x: string) {
  return parseFloat(x.replace(/ /g, ''));
}

function parseDate(arr: string[]) {
  const x = arr[1].split('-');
  return new Date(`${arr[0]} ${x[1]}-${x[0]}-${x[2]}`);
}

async function fetchProfile(id: string | number, instance: AxiosInstance) {
  try {
    const response = await instance.get(`https://www.margonem.pl/profile/view,${id}`);
    if (response.status !== 200 || response.data.includes('<center class=msg>Nie ma takiego gracza</center>')) {
      throw new Error('Brak gracza');
    }
    return response.data as string;
  } catch (err: any) {
    if (err.response) {
      if (err.response.status !== 200) {
        throw new Error('Brak gracza');
      }
    } else {
      throw new Error(err.toString());
    }
  }
}

async function parseMainInfo(root: HTMLElement) {
  const header = safeCall(root.querySelector.bind(root), '.profile-header');
  const dataContainers = safeCall(header.querySelector.bind(header), '.profile-header-data-container').querySelectorAll(
    '.profile-header-data .value',
  );
  const deputyHelper = dataContainers[3].text.trim();
  let deputy = null;
  if (deputyHelper !== 'Brak') {
    const deputyIdHelper =
      safeCall(dataContainers[3].querySelector.bind(dataContainers[3]), 'a').getAttribute('href') || '';
    deputy = {
      id: parseInt(/(\d+)/.exec(deputyIdHelper)?.[1] ?? '', 10),
      nick: deputyHelper,
    };
  }
  return new ProfileInfo(
    safeCall(header.querySelector.bind(header), 'span').text.trim(),
    'https://' +
      safeCall(root.querySelector.bind(root), '.char-icon-big').attributes.style.match(
        /micc.garmory-cdn\.cloud\/obrazki\/[^.]+\.gif/,
      )?.[0],
    dataContainers[0].text.trim().toLowerCase(),
    parseDate(dataContainers[1].structuredText.split('\n')),
    toNumber(dataContainers[2].text),
    parseDate(['00:00', dataContainers[4].text]),
    toNumber(dataContainers[5].text),
    toNumber(dataContainers[6].text),
    toNumber(dataContainers[7].text),
    toNumber(dataContainers[8].text),
    deputy,
  );
}

async function parseProfileCharacters(root: HTMLElement) {
  const charlist = root.querySelectorAll('.character-list li');
  return charlist.map(($e) => {
    const outHelper = safeCall($e.querySelector.bind($e), '.cimg').getAttribute('style') ?? '';
    const guildid = parseInt(safeCall($e.querySelector.bind($e), '.chguildid').getAttribute('value') ?? '', 10);
    let guild: IGuild | null = null;
    if (guildid) {
      let guildname = safeCall($e.querySelector.bind($e), '.chguild').getAttribute('value') ?? '';
      let leader = false;
      if (/ \(założyciel\)$/.test(guildname)) {
        guildname = guildname.substring(0, guildname.length - 13);
        leader = true;
      }
      guild = {
        id: guildid,
        isLeader: leader,
        name: guildname,
      };
    }
    const character = new ProfileCharacter(
      parseInt($e.getAttribute('data-id') ?? '', 10),
      $e.getAttribute('data-nick') ?? '',
      safeCall($e.querySelector.bind($e), '.chgender').getAttribute('value') ?? '',
      parseInt($e.getAttribute('data-lvl') ?? '', 10),
      safeCall($e.querySelector.bind($e), '.chprofname').getAttribute('value') ?? '',
      ($e.getAttribute('data-world') ?? '').substring(1).toLowerCase(),
      'https://micc.garmory-cdn.cloud' + outHelper.match(/\/obrazki\/[^.]+\.gif/)?.[0],
      guild,
      new Date(parseInt(safeCall($e.querySelector.bind($e), '.chlast').getAttribute('value') ?? '', 10) * 1000),
    );
    return character;
  });
}

async function parseProfile(body: string) {
  const root = parse(body.split('<body>')[1].split('</body>')[0], {
    lowerCaseTagName: false,
    blockTextElements: {
      pre: false,
      script: false,
      style: false,
    },
  }) as HTMLElement;
  const profileInfo = await parseMainInfo(root);
  const profileCharacters = await parseProfileCharacters(root);
  return new ProfileData(body, profileInfo, profileCharacters);
}

export async function getProfile(id: number | string, instance: AxiosInstance) {
  try {
    const res = await fetchProfile(id, instance);
    if (res === undefined) throw new Error('Fetch profile failed');
    return parseProfile(res);
  } catch (err: any) {
    throw new Error(err.toString());
  }
}
