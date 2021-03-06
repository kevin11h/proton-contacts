import { c } from 'ttag';

export const getTypeLabels = () => ({
    work: c('Contact type label').t`Work`,
    home: c('Contact type label').t`Personal`,
    cell: c('Contact type label').t`Mobile`,
    main: c('Contact type label').t`Main`,
    yomi: c('Contact type label').t`Yomi`,
    other: c('Contact type label').t`Other`,
    fax: c('Contact type label').t`Fax`,
    pager: c('Contact type label').t`Pager`
});

export const getAllTypes: () => { [key: string]: { text: string; value: string }[] } = () => ({
    fn: [
        { text: c('Property type').t`Name`, value: '' },
        { text: c('Property type').t`Yomi`, value: 'yomi' }
    ],
    n: [],
    nickname: [],
    email: [
        { text: c('Property type').t`Email`, value: '' },
        { text: c('Property type').t`Home`, value: 'home' },
        { text: c('Property type').t`Work`, value: 'work' },
        { text: c('Property type').t`Other`, value: 'other' }
    ],
    tel: [
        { text: c('Property type').t`Phone`, value: '' },
        { text: c('Property type').t`Home`, value: 'home' },
        { text: c('Property type').t`Work`, value: 'work' },
        { text: c('Property type').t`Other`, value: 'other' },
        { text: c('Property type').t`Mobile`, value: 'cell' },
        { text: c('Property type').t`Main`, value: 'main' },
        { text: c('Property type').t`Fax`, value: 'fax' },
        { text: c('Property type').t`Pager`, value: 'pager' }
    ],
    adr: [
        { text: c('Property type').t`Address`, value: '' },
        { text: c('Property type').t`Home`, value: 'home' },
        { text: c('Property type').t`Work`, value: 'work' },
        { text: c('Property type').t`Other`, value: 'other' }
    ],
    bday: [],
    anniversary: [],
    gender: [],
    lang: [],
    tz: [],
    geo: [],
    title: [],
    role: [],
    logo: [],
    photo: [],
    org: [],
    related: [
        { text: c('Property type').t`Contact`, value: 'contact' },
        { text: c('Property type').t`Acquaintance`, value: 'acquaintance' },
        { text: c('Property type').t`Friend`, value: 'friend' },
        { text: c('Property type').t`Met`, value: 'met' },
        { text: c('Property type').t`Co-worker`, value: 'co-worker' },
        { text: c('Property type').t`Colleague`, value: 'colleague' },
        { text: c('Property type').t`Co-resident`, value: 'co-resident' },
        { text: c('Property type').t`Neighbor`, value: 'neighbor' },
        { text: c('Property type').t`Child`, value: 'child' },
        { text: c('Property type').t`Parent`, value: 'parent' },
        { text: c('Property type').t`Sibling`, value: 'sibling' },
        { text: c('Property type').t`Sibling`, value: 'spouse' },
        { text: c('Property type').t`Kin`, value: 'kin' },
        { text: c('Property type').t`Muse`, value: 'muse' },
        { text: c('Property type').t`Crush`, value: 'crush' },
        { text: c('Property type').t`Date`, value: 'date' },
        { text: c('Property type').t`Sweetheart`, value: 'sweetheart' },
        { text: c('Property type').t`Me`, value: 'me' },
        { text: c('Property type').t`Agent`, value: 'agent' },
        { text: c('Property type').t`Emergency`, value: 'emergency' }
    ],
    member: [],
    note: [],
    url: []
});

export const getTypeValues: () => { [key: string]: string[] } = () => ({
    fn: ['', 'yomi'],
    n: [],
    nickname: [],
    email: ['', 'home', 'work', 'other'],
    tel: ['', 'home', 'work', 'other', 'cell', 'main', 'fax', 'pager'],
    adr: ['', 'home', 'work', 'other'],
    bday: [],
    anniversary: [],
    gender: [],
    lang: [],
    tz: [],
    geo: [],
    title: [],
    role: [],
    logo: [],
    org: [],
    related: [
        'contact',
        'acquaintance',
        'friend',
        'met',
        'co-worker',
        'colleague',
        'co-resident',
        'neighbor',
        'child',
        'parent',
        'sibling',
        'spouse',
        'kin',
        'muse',
        'crush',
        'date',
        'sweetheart',
        'me',
        'agent',
        'emergency'
    ],
    member: [],
    note: [],
    url: []
});
