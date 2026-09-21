import Dexie from 'dexie';

export const db = new Dexie('AppSettingsDB');

db.version(1).stores({
  settings: 'key'
});