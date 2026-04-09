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

## Weather Data

Weather data is fetched from [Open-Meteo API](https://open-meteo.com/) for Oslo, Norway.
