# TOSSER OF COIN
## Mathieu HERNANDEZ 2024-2025

---

Tosser of Coin is a Express.js-based game. The point is to be able to play only using the back-end.

## Build & Run

To build, create the database, and run :

```$ npm run build ```

```$ npm run db ```

```$ npm run start ```

## Authentification


You must register at POST http://localhost:3000/auth/register and log in at POST http://localhost:3000/auth/login to play.

Required register fields :

- email (unique)

- username (unique)

- password

- confirmPassword (indentical to password)

Required login fields :

- email

- password

Then, you must keep the refresh token (given in login and register) to get access tokens, at http://localhost:3000/auth/refresh-token,
but you can also login again.

You need an access token to start a game, toss a coin, and check your inventory (Authorization header in every case).

## How to play

To start a game, simply send a request at POST http://localhost:3000/game with a 'category' field.

Then, to play, post at http://localhost:3000/game/toss-coin, with a JSON body like this :

            {
                "guess":"heads",
                "items":{
                    "lead":{
                        "quantity":1,
                        "side":"tails"
                    },
                    "heavyLead":{
                        "quantity":2,
                        "side":"tails"
                    },
                    "leadmite":{
                        "quantity":0,
                        "side":"tails"
                    },
                    "heavyLeadmite":{
                        "quantity":0,
                        "side":"tails"
                    },
                    "spring":0,
                    "genieCoin":0,
                    "cheaterCoin":0
                }	
            }
- guess needs to be 'heads' or 'tails'.

### Items
- You will earn a quantity of a random item each round. Some may drop more often than others. You will also get rewards when you lose.
- Leads (lead) can stack up to 5, and a Heavy lead (heavyLead) count as 2 leads. They add weight to a chosen side of your coin, make sure to play them on the opposite side as your guess. they need to have 'side' and 'quantity' attributes.
- A Spring (spring) can save you once per game if you guess wrong.
- A Genie's coin (genieCoin) can either double or halve your score. It isn't affected by other items.
- A Cheater's coin (cheaterCoin) has a 90% chance of giving you 2 points, but if you guess wrong, you lose 10 points. It isn't affected by other items.

### Invaders
- Beside rewards, insects may invade your inventory every round.
- Leadmites (leadmite) and Heavy leadmites (heavyLeadmite) will eat respectively Leads and Heavy leads every round. 
    - To get rid of them, you need to place them on your coin, but you cannot place them on the same side as your leads. 
    - You will get 2 points per leadmite eliminated (3 for heavyLeadmites).

## Documentation

To get information about the API, you can check the OpenAPI documentation at http://localhost:3000/api/documentation.

It also lets you test every endpoint, with example data.

## Rose-Based Access Control

In this API, most routes are protected with a RBAC Middleware.
Most endpoints need authentification, and some are only usable by admins or superAdmins.

- You can play a game, check your inventory, existing items and the leaderboard as a 'player'.

- Users with 'admin' role can create, update and delete items. They can also ban players, and deban them.

- Getting banned sets changes your role to 'banned'. As a banned player, you cannot log in nor access any route protected by the middleware.

- There is also the 'superAdmin' role, which lets you promote players to admins, and demote them.

superAdmin has all the authorizations of an admin, which has all the authorizations of a player.

## Tests

Controllers have spec files containing tests for multiple use cases.

To run all tests with Jest, you need to run :

```$ npm run test```

---