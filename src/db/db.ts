import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function initDB() {
  const db = await open({
    filename: './database.db',
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      admin BOOLEAN NOT NULL DEFAULT FALSE
    );
    
    CREATE TABLE IF NOT EXISTS Items (
      itemId TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      rarity INTEGER NOT NULL,
      maxQuantity INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Games (
      gameId INTEGER PRIMARY KEY,
      user INTEGER NOT NULL,
      score INTEGER NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY(user) REFERENCES Users(id)
    );

    CREATE TABLE IF NOT EXISTS Stock (
      item TEXT NOT NULL,
      user INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      PRIMARY KEY (item, user),
      FOREIGN KEY(item) REFERENCES Items(itemId) ON DELETE CASCADE,
      FOREIGN KEY(user) REFERENCES Users(id)
    );
    
    CREATE TABLE IF NOT EXISTS GameItem (
      item TEXT NOT NULL,
      game INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      PRIMARY KEY (item, game),
      FOREIGN KEY(item) REFERENCES Items(itemId) ON DELETE CASCADE,
      FOREIGN KEY(game) REFERENCES Games(gameId) ON DELETE CASCADE
    );
  `);

  return db;
}
