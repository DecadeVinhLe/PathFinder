

# Pathfinder: Smart Trip Planning for Ho Chi Minh City

Pathfinder is a bilingual (English / Vietnamese) web app that helps people in Ho Chi Minh City pick the smartest way to get somewhere. It compares bike, car, public transit and ride-hail by **time, cost and weather**, predicts rush hour, and points you to the right page for your trip.

> **Who we are:** this is the work of our group, **Crusaders**, built as our project for **Swin-Biz Rockstar**.

> **Demo project.** Traffic levels, parking, ride-hail prices, the bus timetable and the metro line are **sample data**. Weather is pulled live from Open-Meteo when available and falls back to a sample snapshot. Nothing here should be used for real trip decisions yet.


<p align="center"> <img src="[public/images/readme-banner.png](https://wall.alphacoders.com/big.php?i=1245161)" alt="A traffic light against a blue summer sky" width="100%"> </p>
## Features

- **Journey planner**: door-to-door plans that mix walking, your own bike or car, parking, bus, metro and ride-hail, with clock times and weather
- **Public transit finder**: the best bus for your time window, plus alternates and a timetable
- **Rush-hour prediction**: an hourly traffic chart and quieter departure slots
- **Weather advice**: rain, heat and storm warnings change the recommended vehicle
- **Private vs public**: your bike or car side by side with public transport
- **Trip watch and alerts**: warns you if weather or traffic changes after you plan
- **Community and monthly survey**, **partner vouchers**, and a **guide chat**
- English / Vietnamese switch, dark / light theme, and a 3D animated hero

## How the core tools work

### 1. Journey planner and the Pathfinder engine
`src/js/features/journey.js`

You enter a start, a destination and either a **leave-at** or an **arrive-by** time, plus your own vehicle (bike, car or none).

1. **Places are resolved** from a built-in list of Ho Chi Minh City landmarks first, then from OpenStreetMap (Nominatim) for anything else. Raw `lat,lng` also works.
2. **A network is built** from the bus routes in `data/routes.js` and a sample metro line, with walking transfers between nearby stops.
3. **An earliest-arrival search** runs over that timetable network. It waits for the next real departure on each line, adds jam delays on congested segments, and slows walking in rain or heat.
4. **Door-to-door options are assembled**: park and ride, public transit only, direct by own vehicle, or ride-hail for the first or last mile. Parking fees, ride-hail quotes and weather come from pluggable *providers*.
5. **Results are ranked and tagged** (fastest, cheapest, least rain, public transport, door to door).
6. For **arrive-by**, it tries departure times backwards from your deadline and keeps the options that still arrive on time.

Every journey can be copied as JSON, exported to your calendar (`.ics`) or shared as a link.

### 2. Public transit finder
`src/js/features/public-transit.js` and `src/js/core/engine.js`

Pick two stops, the time you can leave and the time you must arrive. The engine lists every departure on every route that serves both stops and works out the wait, ride time (including jam delay), arrival and slack against your deadline. It then recommends one trip, explains why in plain words (shortest wait, avoids peak, shortest total), warns about congested segments, and shows the nearest trip on other routes inside your tolerance window. Maps and directions open in Google Maps.

### 3. Rush-hour model and traffic chart
`src/js/core/peak.js` and `src/js/features/traffic-chart.js`

Three peak windows (07:00-09:00, 11:30-13:00, 16:30-19:00) set a crowd level from 0 to 3 for any time of day. If you plan to travel at a busy time, Pathfinder suggests nearby 15-minute slots that are less crowded. The same model draws a smoothed SVG chart of expected traffic from 05:00 to 23:00 with your hour highlighted.

### 4. Weather advice
`src/js/features/weather.js`

A sample hourly snapshot is shown immediately. In the background the app asks **Open-Meteo** for the real forecast, with a timeout and a retry button. Each hour is classed as clear, fog, heat, rain, heavy rain or storm. That class feeds the vehicle comparison, the Journey planner (walking speed, outdoor rain minutes) and the trip alerts.

### 5. Planner and private-vs-public comparison
`src/js/features/compare.js`, `src/js/features/private-vehicle.js`

Pick two districts and a time. Distance is estimated from straight-line distance with a detour factor, scaled by the rush-hour multiplier for that hour and the weather, then turned into time and cost for bike, car, bus and ride-hail. The Private vehicle page adds alternate routes on an embedded Google Map and a "best time to leave" table from one hour earlier to one and a half hours later.

### 6. Trip watch, alerts and notification bell
`src/js/features/trip-watch.js`, `src/js/features/notifications.js`

When you save a plan, Pathfinder re-checks every 30 seconds and raises an alert if the weather gets worse, the forecast worsens before your departure, traffic climbs to a higher level, or it is time to leave within 15 minutes. Alerts appear as a banner and are kept in the bell menu (latest 30, stored on your device).

### 7. Place suggestions
`src/js/features/place-autocomplete.js`

The From and To boxes on Journey, Private vehicle and Shared ride suggest saved places, your recent searches and OpenStreetMap results limited to Vietnam, and offer "use my current location". Arrow keys, Enter and Escape work.

### 8. Community, vouchers, chat
`src/js/features/community.js`, `ads-vouchers.js`, `chat.js`

- **Community**: comments, experiences and suggestions with a filter and average rating, plus one survey per month
- **Vouchers**: demo partner codes with an expiry once redeemed, and rotating ad slots
- **Guide chat**: keyword rules that point you to the right page. It does not call an AI service.

All of these save to your browser (`localStorage`) only. Nothing is sent to a server.

## Use Pathfinder from another page or app

The planner is exposed as `window.Pathfinder` (schema `pathfinder.journey/1`).

```js
const result = await Pathfinder.plan({
  from: 'Vinhomes Grand Park',
  to: 'Quận 3',
  depart: '07:30',        // or arriveBy: '09:00'
  vehicle: 'bike',        // 'bike' | 'car' | 'none'
});

// Plug in your own data (providers are synchronous)
Pathfinder.register('weather', {
  at: ({ minute }) => ({ kind: 'rain', tempC: 29, rainPct: 80, icon: '🌧️' }),
}, 'MyWeatherApp');

Pathfinder.on('plan', (res) => console.log(res));
```

Provider kinds are `geocode`, `weather`, `traffic`, `parking` and `ridehail`. You can add a whole network with `Pathfinder.addNetwork(...)`. An embedded page can also talk to it with `postMessage` (`pathfinder:plan`, `pathfinder:capabilities`). The Journey page has a "Connect to other apps" section with the full guide.

## Tech stack

| Area | Choice |
| --- | --- |
| UI | Plain HTML, CSS and JavaScript (no framework, no build step) |
| 3D hero | [three.js](https://threejs.org/) r128 from cdnjs, hidden automatically if WebGL is unavailable |
| Font | Be Vietnam Pro (Google Fonts) |
| Weather | [Open-Meteo](https://open-meteo.com/) forecast API |
| Places | [OpenStreetMap Nominatim](https://nominatim.org/) search |
| Maps | Google Maps embeds and directions links (no API key) |
| Storage | Browser `localStorage` |
| Tooling | Node.js + pnpm (dev server and checker only) |
| Hosting | GitHub Pages through GitHub Actions |

## Project structure

```text
Pathfinder/
├── .github/workflows/deploy.yml   # check on every PR, deploy main to GitHub Pages
├── public/
│   └── images/                    # logo, hero background, README banner
├── scripts/
│   └── check.mjs                  # syntax + reference checker (pnpm run check)
├── src/
│   ├── css/                       # 18 stylesheets, loaded in numeric order
│   │   ├── 01-tokens.css          #   colours, shadows, dark theme
│   │   ├── 02-base.css … 09-chat-toast.css
│   │   ├── 10-ads.css … 16-journey.css
│   │   └── 17-restyle.css, 18-place-suggest.css
│   └── js/
│       ├── core/                  # helpers, time, rush-hour model, transit engine, app shell, boot
│       ├── data/                  # stops, routes, districts, places, promos
│       ├── i18n/                  # English / Vietnamese strings
│       └── features/              # one file per tool (journey, weather, chat, …)
├── index.html                     # markup + ordered <link>/<script> tags
├── CONTRIBUTING.md
├── LICENSE
├── package.json
└── README.md
```

> **Why the script order matters:** there is no bundler, so the files in `src/js/` are plain scripts that share one global scope. A file can only use what is declared in files listed above it in `index.html`. `features/journey.js` stays in one piece on purpose, because the Pathfinder engine and its UI share private state.

## Getting started

### Prerequisites

- [Git](https://git-scm.com/)
- **[Node.js](https://nodejs.org/) 18 or higher. You must install Node first**, because pnpm and the dev server run on it. Check with `node -v`.
- [pnpm](https://pnpm.io/installation): after installing Node, run `npm install -g pnpm` (or `corepack enable`). Check with `pnpm -v`.

### Clone and run

```bash
git clone https://github.com/<your-username>/Pathfinder.git
cd Pathfinder
pnpm run dev
```

There are no dependencies, so no `pnpm install` is needed. The site runs at <http://localhost:5173>. You can also open `index.html` directly in a browser, or use any static server such as `python3 -m http.server`.

### Check your changes

```bash
pnpm run check
```

This verifies that every script parses, every file referenced by `index.html` exists, and no source file has been left out of the page.

## Deploying

Pushes to `main` run the checks and publish the site with GitHub Pages. Enable it once under **Settings → Pages → Source: GitHub Actions**.

## Team Crusaders

Built for **Swin-Biz Rockstar**.

| Member | Role | GitHub |
| --- | --- | --- |
| _Add name_ | _Add role_ | [@username](https://github.com/username) |
| _Add name_ | _Add role_ | [@username](https://github.com/username) |
| _Add name_ | _Add role_ | [@username](https://github.com/username) |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow, where files go and the rules for translations and sample data.

## License

Released under the [MIT License](LICENSE).
