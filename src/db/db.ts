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
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'player'
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


    
    INSERT OR IGNORE INTO Items (itemId, name, description, rarity, maxQuantity) VALUES 
    ('lead', 'Lead', 'A lead disc that can add mass to one side of your coin. You can stack multiple at a time.', 55, 5),
    ('heavyLead', 'Heavy Lead', 'A heavy lead disc that can add mass to one side of your coin. You can stack multiple at a time.', 40, 5),
    ('genieCoin', 'Genie''s Coin', 'A shiny coin that doubles the score if you guess correctly but cuts it by half if you guess wrong. Cancels out other items for the round.', 10, 1),
    ('cheaterCoin', 'Cheater''s Coin', 'A rigged coin that gives you 90% chance to win the round but removes 10 points from your score if you guess wrong. Cancels out other items for the round.', 8, 1),
    ('leadmite', 'Leadmite', 'An insect that will eat lead from your inventory every round. Place it on your coin to get rid of it, but you can''t place it on the same side as leads.', 8, 1),
    ('heavyLeadmite', 'Heavy Leadmite', 'A big insect that will eat a heavy lead from your inventory every two rounds. Place it on your coin to get rid of it, but don''t place it on the same side as your leads, or it will eat them.', 5, 1);
  `);

  return db;
}

// ('pyrite', 'Pyrite', 'A pyrite disc that gives 5 points if you guess correctly. Takes as much space as a heavy lead but is lighter.', 5, 2),
// ('miteCoin', 'Mite Coin', 'A weird coin slightly heavier on the chosen side that will give you 10 points if guessed right, but will drop 5 leadmites in your inventory if you guess wrong. Cancels out other items for the round.', 5, 1),
// ('killerWasp', 'Killer Wasp', 'A wasp that will eliminate invaders in exchange of points from your score. The more invaders, the more expensive the cleaning will be.', 7, 2),
// ('leadmiteQueen', 'Leadmite Queen', 'A leadmite queen that will eat two leads and a heavy lead every round. Place it on your coin 3 times to get rid of it.', 0.5, 1), 