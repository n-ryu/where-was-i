import { db } from './database'

export async function getSetting(key: string): Promise<string | null> {
  const setting = await db.settings.get(key)
  return setting?.value ?? null
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.settings.put({ key, value })
}

export async function deleteSetting(key: string): Promise<void> {
  await db.settings.delete(key)
}
