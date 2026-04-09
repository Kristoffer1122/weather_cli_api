# Weather CLI

A terminal-based weather application that displays beautiful ASCII art weather forecasts.

## Features

- Displays weather for 4 time periods: Morning (8:00), Afternoon (14:00), Evening (20:00), and Night (2:00)
- Beautiful ASCII art for different weather conditions (sunny, cloudy, rainy, snowy)
- Color-coded display
- Responsive terminal sizing (small, medium, large)

## Prerequisites

- [Bun](https://bun.sh) runtime

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```

## Usage

Run the application:
```bash
bun run weather.ts
```

### Install as a global command

To run the app by just typing `weather` from anywhere:

1. Add a shebang to the top of `weather.ts`:
   ```typescript
   #!/usr/bin/env bun
   ```

2. Make the file executable:
   ```bash
   chmod +x weather.ts
   ```

3. Create a symlink in `/usr/local/bin`:
   ```bash
   sudo ln -s $(pwd)/weather.ts /usr/local/bin/weather
   ```

4. Now you can run it from anywhere:
   ```bash
   weather
   ```

## Weather Data

Weather data is fetched from [Open-Meteo API](https://open-meteo.com/) for Oslo, Norway.
