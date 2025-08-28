class CRMDatabase {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("CRMDatabase", 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Organizations store
        if (!db.objectStoreNames.contains("organizations")) {
          const orgStore = db.createObjectStore("organizations", { keyPath: "id", autoIncrement: true })
          orgStore.createIndex("name", "name", { unique: false })
          orgStore.createIndex("industry", "industry", { unique: false })
          orgStore.createIndex("country", "country", { unique: false })
          orgStore.createIndex("status", "status", { unique: false })
        }

        // Contacts store
        if (!db.objectStoreNames.contains("contacts")) {
          const contactStore = db.createObjectStore("contacts", { keyPath: "id", autoIncrement: true })
          contactStore.createIndex("organizationId", "organizationId", { unique: false })
          contactStore.createIndex("email", "email", { unique: false })
        }

        // Deals store
        if (!db.objectStoreNames.contains("deals")) {
          const dealStore = db.createObjectStore("deals", { keyPath: "id", autoIncrement: true })
          dealStore.createIndex("organizationId", "organizationId", { unique: false })
          dealStore.createIndex("stage", "stage", { unique: false })
          dealStore.createIndex("owner", "owner", { unique: false })
        }

        // Activities store
        if (!db.objectStoreNames.contains("activities")) {
          const activityStore = db.createObjectStore("activities", { keyPath: "id", autoIncrement: true })
          activityStore.createIndex("organizationId", "organizationId", { unique: false })
          activityStore.createIndex("contactId", "contactId", { unique: false })
          activityStore.createIndex("type", "type", { unique: false })
          activityStore.createIndex("date", "date", { unique: false })
        }

        // Users store
        if (!db.objectStoreNames.contains("users")) {
          const userStore = db.createObjectStore("users", { keyPath: "id", autoIncrement: true })
          userStore.createIndex("email", "email", { unique: true })
        }
      }
    })
  }

  async saveToStore<T>(storeName: string, data: T): Promise<number> {
    if (!this.db) throw new Error("Database not initialized")

    const transaction = this.db.transaction([storeName], "readwrite")
    const store = transaction.objectStore(storeName)

    return new Promise((resolve, reject) => {
      const request = (data as any).id ? store.put(data) : store.add(data)
      request.onsuccess = () => resolve(request.result as number)
      request.onerror = () => reject(request.error)
    })
  }

  async getFromStore<T>(storeName: string, key?: number): Promise<T | T[]> {
    if (!this.db) throw new Error("Database not initialized")

    const transaction = this.db.transaction([storeName], "readonly")
    const store = transaction.objectStore(storeName)

    return new Promise((resolve, reject) => {
      const request = key ? store.get(key) : store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async deleteFromStore(storeName: string, key: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    const transaction = this.db.transaction([storeName], "readwrite")
    const store = transaction.objectStore(storeName)

    return new Promise((resolve, reject) => {
      const request = store.delete(key)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getFromIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
    if (!this.db) throw new Error("Database not initialized")

    const transaction = this.db.transaction([storeName], "readonly")
    const store = transaction.objectStore(storeName)
    const index = store.index(indexName)

    return new Promise((resolve, reject) => {
      const request = index.getAll(value)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
}

export const crmDB = new CRMDatabase()
