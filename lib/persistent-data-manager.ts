// Persistent Data Manager with Local File Storage
// 持久化数据管理器（本地文件存储）

import { promises as fs } from 'fs'
import path from 'path'

class PersistentDataManager {
  async loadData<T>(fileName: string, defaultData?: T): Promise<T | null> {
    try {
      const filePath = path.join(process.cwd(), 'data', fileName)
      const fileContent = await fs.readFile(filePath, 'utf8')
      const localData = JSON.parse(fileContent)
      console.log(`${fileName} loaded from local file:`, filePath)
      return localData as T
    } catch (error) {
      console.log(`Failed to load ${fileName}, using default:`, error)
      return defaultData || null
    }
  }

  async saveData<T>(fileName: string, data: T): Promise<boolean> {
    try {
      const filePath = path.join(process.cwd(), 'data', fileName)

      // Ensure data directory exists
      const dataDir = path.dirname(filePath)
      await fs.mkdir(dataDir, { recursive: true })

      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')
      console.log(`${fileName} saved to local file:`, filePath)
      return true
    } catch (error) {
      console.error(`Failed to save ${fileName}:`, error)
      return false
    }
  }

  isProductionMode(): boolean {
    return false // Always use local file system
  }

  getStorageInfo(): { mode: string; configured: boolean } {
    return { mode: 'Local File System', configured: true }
  }
}

export const persistentDataManager = new PersistentDataManager()
export default PersistentDataManager