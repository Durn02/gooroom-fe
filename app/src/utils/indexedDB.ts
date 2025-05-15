import { openDB, IDBPDatabase } from 'idb';
import { RoommateWithNeighbors } from '../types/DomainObject/landingPage.type';

export const initDB = async (): Promise<IDBPDatabase> => {
  return openDB('gooroomidb', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('roommates')) {
        db.createObjectStore('roommates', { keyPath: 'nodeId' });
      }
      if (!db.objectStoreNames.contains('neighbors')) {
        db.createObjectStore('neighbors', { keyPath: 'nodeId' });
      }
    },
  });
};

export const saveDatas = async (storeName: string, data, batchSize: number = 100) => {
  const db = await initDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    await Promise.all(batch.map((item) => store.put(item)));
  }

  await tx.done;
};

export const saveRoommates = async (roommatesWithNeighbors: RoommateWithNeighbors[], batchSize: number = 100) => {
  const db = await initDB();
  const tx = db.transaction('roommates', 'readwrite');
  const store = tx.objectStore('roommates');

  for (let i = 0; i < roommatesWithNeighbors.length; i += batchSize) {
    const batch = roommatesWithNeighbors.slice(i, i + batchSize);
    const transformedBatch = batch.map((item) => ({
      ...item,
      nodeId: item.roommate?.nodeId,
    }));

    console.log('transformedBatch : ', transformedBatch);
    await Promise.all(transformedBatch.map((transformedBatch) => store.put(transformedBatch)));
  }

  await tx.done;
};

export const getData = async (storeName: string, key: string) => {
  const db = await initDB();
  return db.transaction(storeName, 'readonly').objectStore(storeName).get(key);
};

export const getAllData = async (storeName: string) => {
  const db = await initDB();
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  return await store.getAll();
};

export const getAllRoommates = async () => {
  const db = await initDB();
  const tx = db.transaction('roommates', 'readonly');
  const store = tx.objectStore('roommates');
  const allData = await store.getAll();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return allData.map(({ nodeId: _nodeId, ...rest }) => rest);
};

export const deleteData = async (storeName: string, key: string) => {
  const db = await initDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  await store.delete(key);
  await tx.done;
};

export const clearStore = async (storeName: string) => {
  const db = await initDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  await store.clear();
  await tx.done;
};
