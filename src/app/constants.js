export const CONTACT_IMG_SIZE = 128;
export const POST_BOX = 0;
export const EXTENDED = 1;
export const STREET = 2;
export const LOCALITY = 3;
export const REGION = 4;
export const POSTAL_CODE = 5;
export const COUNTRY = 6;

// List of fields display in the bottom section for contact view
export const OTHER_INFORMATION_FIELDS = [
    'bday',
    'anniversary',
    'gender',
    'lang',
    'tz',
    'geo',
    'title',
    'role',
    'photo',
    'logo',
    'org',
    'member',
    'note',
    'url'
];

export const VCARD_KEY_FIELDS = ['key', 'x-pm-mimetype', 'x-pm-encrypt', 'x-pm-sign', 'x-pm-scheme', 'x-pm-tls'];
export const CLEAR_FIELDS = ['version', 'prodid', 'categories'];
export const SIGNED_FIELDS = ['version', 'prodid', 'fn', 'uid', 'email'].concat(VCARD_KEY_FIELDS);