// Stub implementation for GitHub storage
// This is a simplified stub that always returns false/null
// to remove the dependency while maintaining API compatibility

interface GitHubStorage {
  loadData: (fileName: string) => Promise<any | null>
  saveData: <T>(fileName: string, data: T) => Promise<boolean>
  isConfigured: () => boolean
}

class GitHubStorageStub implements GitHubStorage {
  async loadData(fileName: string): Promise<any | null> {
    // Always return null to fallback to local file system
    return null
  }

  async saveData<T>(fileName: string, data: T): Promise<boolean> {
    // Always return false to fallback to local file system
    return false
  }

  isConfigured(): boolean {
    // Return false since we don't have GitHub integration
    return false
  }
}

export const githubStorage = new GitHubStorageStub()
export default GitHubStorageStub