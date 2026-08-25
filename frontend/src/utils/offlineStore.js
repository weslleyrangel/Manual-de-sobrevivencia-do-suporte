const DB_NAME = 'ITSupportDB';
const STORE_NAME = 'problems';

export function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function saveProblemsOffline(problems) {
    if (typeof window === 'undefined' || !window.indexedDB) return;
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        
        store.clear(); // Limpa catálogo velho
        problems.forEach(p => store.put(p)); // Salva os atuais
        
        return new Promise((resolve) => {
            tx.oncomplete = () => resolve();
        });
    } catch (err) {
        console.error('Offline DB Error:', err);
    }
}

export async function getOfflineProblems() {
    if (typeof window === 'undefined' || !window.indexedDB) return [];
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();
        
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (err) {
        console.error('Offline DB Error:', err);
        return [];
    }
}
