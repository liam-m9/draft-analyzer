# Deadlock Drafter

Live: https://draft-analyzer-olive.vercel.app/

I play Deadlock in ascendant and wanted a tool to analyse drafts, so I built one. Pick six heroes on each side and the app gives you a team score, a matchup grid, and a list of suggested next picks. All the data comes from the community Deadlock API.

## Running it

```
npm install
npm run fetch-data
npm run dev
```

Open http://localhost:5173. `npm run build` makes a production bundle, `npm run lint` runs ESLint, and `npm run fetch-data` pulls fresh hero data from the API into `src/data/*.json`.

## How scoring works

Each team gets a score from 0 to 100. It updates every time you add or remove a hero. The score is a weighted blend of three things.

First, the average win rate of the heroes on the team. This is just the mean of each hero's overall win rate from millions of ranked games. It tells you how strong the picks are individually, ignoring context. Weight is 0.3.

Second, synergy. For every pair of heroes on the same team (15 pairs in a full lineup), the code looks up the historical win rate when those two heroes play together. Good pairs push the score up, bad pairs drag it down. Weight is 0.3.

Third, matchup. For every cross-team hero pair (36 in a 6v6), how often your hero beats their hero in the data. This gets the highest weight, 0.4, because the whole point of drafting last is countering the enemy.

Synergy and matchup come back as win rates around 0.5. The code subtracts 0.5 to get a delta, averages the deltas, multiplies by 500, and re-centres on 50. So a mean synergy delta of +0.04 across a team (roughly a 54% pair win rate) maps to 70 on the synergy component. That's enough to noticeably move the total.

The centre panel shows the matchup grid. Each cell is coloured green or red proportional to how lopsided the win rate is. Each team's sidebar shows the top 5 suggested next picks when there's an open slot. Each suggestion's score is the marginal gain from adding that hero to the team. The reason line shows whichever signal is strongest for that hero. "counters X" if the counter delta beats the synergy delta, "pairs with Y" otherwise. There's a 0.02 floor so weak signals get skipped.

## Data

Everything is pre-baked into `src/data/*.json` at build time. The app doesn't hit the network at runtime, it just reads the static tables. The fetch script pulls hero metadata from `assets.deadlock-api.com/v2/heroes` and three endpoints under `api.deadlock-api.com/v1/analytics/` for hero stats, counter stats, and synergy stats. Pairs with fewer than 500 matches are dropped as noise.
