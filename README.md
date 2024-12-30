# TOSSER OF COIN
## Mathieu HERNANDEZ - 2024

Tosser of Coin is a Express.js-based game. The point is to be able to play only using the back-end.

## BUILD & RUN

To build, create the database, and run :

```$ npm run build ```

```$ npm run db ```

```$ npm run start ```

## AUTHENTIFICATION


You must register at POST http://localhost:3000/auth/register and login at POST http://localhost:3000/auth/login to play.

Required register fields :

email

username (unique)

password

confirmPassword

Required login fields :

email

password

Then, you must keep the refresh token (given in login and register) to get access tokens, at http://localhost:3000/auth/refresh-token,
but you can also login again.

You need an access token to start a game, toss a coin, and check your inventory (Authorization header in every case).

# HOW TO PLAY

To start a game, simply send a request at POST http://localhost:3000/game/start with a 'category' field.

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
- leads can stack up to 5, and a heavyLead counts as 2 leads. They add weight to a side of your coin, make sure to play them on the opposite side as your guess. they need to have 'side' and 'quantity' attributes.
- leadmites and heavyLeadmites will eat respectively leads and heavyLeads every round. To get rid of them, you need to place them on your coin, but not on the same side as your leads. You will get 2 points per leadmite eliminated (3 for heavyLeadmites).
- a spring can save you once per game if you guess wrong.
- a genieCoin can either double or halve your score.
- a cheaterCoin has a 90% chance of giving you 2 points, but if you guess wrong, you lose 10 points.

To get other information about the API, you can check the OpenAPI documentation at http://localhost:3000/api/documentation, when you can test all endpoints.

# TESTS

To run all tests, run

```$ npm run test```
