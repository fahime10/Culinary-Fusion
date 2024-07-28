import { openDB } from "idb";

const dbPromise = openDB("local_db", 1, {
    upgrade(db) {
        if (!db.objectStoreNames.contains("recipes")) {
            const store = db.createObjectStore("recipes");
            store.createIndex("timestamp", "timestamp");
        }
    }
});

export async function getRecipe(key) {
    try {
        const db = await dbPromise;
        const transaction = db.transaction("recipes", "readonly");
        const store = transaction.objectStore("recipes");
        const recipe = await store.get(key);
        await transaction.done;
        return recipe;

    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function setRecipe(key, val) {
    try {
        const db = await dbPromise;
        const t = db.transaction("recipes", "readwrite");
        const store = t.objectStore("recipes");
        const dataToStore = { ...val, timestamp: new Date().getTime() };
        await store.put(dataToStore, key);
        await t.done;

    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function clearRecipes() {
    try {
        const db = await dbPromise;
        const t = db.transaction("recipes", "readwrite");
        const store = t.objectStore("recipes");
        await store.clear();
        await t.done;

    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function clearUserRecipes() {
    try {
        const db = await dbPromise;
        const t = db.transaction(["recipes", "readwrite"]);
        const store = t.objectStore("recipes");

        const keys = await store.getAllKeys();

        for (const key of keys) {
            if (key.startsWith("user_recipes")) {
                await store.delete(key);
            }
        }

        await t.done;
        
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export function deleteDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase("local_db");

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    })
}