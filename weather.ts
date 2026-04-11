#!/usr/bin/env bun
import chalk from "chalk"
// @ts-ignore
import asciiart from "./weather_ascii.json" assert { type: "json" };
const API_URL: string = 'https://api.open-meteo.com/v1/forecast?latitude=59.9127&longitude=10.7461&daily=sunrise,sunset,weather_code,uv_index_max&hourly=temperature_2m,snowfall,rain,cloud_cover,apparent_temperature&current=temperature_2m,apparent_temperature,rain,snowfall&timezone=Europe%2FBerlin&forecast_days=2'

const width = process.stdout.columns;
const height = process.stdout.rows;

const asciiArt = asciiart;

type TerminalSize = "small" | "medium" | "large";

function getTerminalSize(): TerminalSize {
    if (width < 80) {
        return "small";
    } else if (width < 120 && width > 80) {
        return "medium";
    } else {
        return "large";
    }
}

const RAIN_THRESHOLD = 0.5; // mm
const SNOW_THRESHOLD = 0.1; // cm
const CLOUD_THRESHOLD = 50; // %

type WeatherState = {
    snowy: boolean;
    rainy: boolean;
    cloudy: boolean;
};

type HourlyWeatherData = {
    temperature_2m: number[];
    snowfall: number[];
    rain: number[];
    cloud_cover: number[];
};

async function fetchWeather() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        const hourlyData: HourlyWeatherData = data.hourly;

        // Morning, Afternoon, Evening, Night (next day)
        const hours = [8, 14, 20, 26];

        const states: Record<number, WeatherState> = {
            8: { snowy: false, rainy: false, cloudy: false },
            14: { snowy: false, rainy: false, cloudy: false },
            20: { snowy: false, rainy: false, cloudy: false },
            26: { snowy: false, rainy: false, cloudy: false }
        };

        const temperatures: number[] = [];

        hours.forEach((hourIndex) => {
            if (!hourlyData.temperature_2m[hourIndex]) {
                throw new Error(`Missing weather data for hour ${hourIndex}`);
            }

            temperatures.push(hourlyData.temperature_2m[hourIndex]);

            if (hourlyData.snowfall[hourIndex] > SNOW_THRESHOLD) {
                states[hourIndex].snowy = true;
            } else if (hourlyData.rain[hourIndex] > RAIN_THRESHOLD) {
                states[hourIndex].rainy = true;
            } else if (hourlyData.cloud_cover[hourIndex] > CLOUD_THRESHOLD) {
                states[hourIndex].cloudy = true;
            }
        });

        const terminalSize = getTerminalSize();
        const artLines = asciiArt[terminalSize].sunny.length;
        const artWidth = asciiArt[terminalSize].sunny[0].length;

        // Display current weather
        console.log(chalk.bold.cyan('\n📍  Oslo, Norway'));
        console.log(chalk.bold.white(`🌡️  Current: ${data.current.temperature_2m}°C (feels like ${data.current.apparent_temperature}°C)\n`));

        // Print header with hours and temperatures
        const header = hours.map((hour, i) => {
            const timeText = formatHourTo12Hour(hour);
            const tempText = ` ${Math.round(temperatures[i])}°C`;
            const padding = ' '.repeat(Math.max(0, artWidth - timeText.length - tempText.length));
            return chalk.bold.white(timeText) + chalk.bold.yellow(tempText) + padding;
        }).join('  ');
        console.log(header);

        // Print each line of ASCII art horizontally
        for (let lineIndex = 0; lineIndex < artLines; lineIndex++) {
            const lineSegments = hours.map((hourIndex) => {
                const state = states[hourIndex];
                let artLine = '';

                if (state.snowy) {
                    artLine = chalk.white(asciiArt[terminalSize].snowy[lineIndex]);
                } else if (state.rainy) {
                    artLine = chalk.cyan(asciiArt[terminalSize].rainy[lineIndex]);
                } else if (state.cloudy) {
                    artLine = chalk.gray(asciiArt[terminalSize].cloudy[lineIndex]);
                } else {
                    artLine = chalk.yellow(asciiArt[terminalSize].sunny[lineIndex]);
                }
                return artLine;
            });
            console.log(lineSegments.join('  '));
        }

        // Display UV index warning if high
        const uvIndex = data.daily.uv_index_max[0];
        if (uvIndex >= 6) {
            console.log(chalk.yellow(`\n⚠️  High UV Index: ${uvIndex} - Use sunscreen!`));
        }

        console.log(); // Empty line at end

    } catch (error) {
        console.error(chalk.red('❌ Error fetching weather data:'), error);
        process.exit(1);
    }
}


function formatHourTo12Hour(time: number): string {
    let hour = time % 24;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12;
    return `${hour}:00 ${ampm}`;
}

fetchWeather()
