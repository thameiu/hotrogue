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
      itemId INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      rarity INTEGER NOT NULL,
      maxQuantity INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Games (
      gameId INTEGER PRIMARY KEY,
      user INTEGER NOT NULL,
      score TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY(user) REFERENCES Users(id)
    );

    CREATE TABLE IF NOT EXISTS Stock (
      item INTEGER NOT NULL,
      user INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      PRIMARY KEY (item, user),
      FOREIGN KEY(item) REFERENCES Items(itemId),
      FOREIGN KEY(user) REFERENCES Users(id)
    );
  `);

  return db;
}
