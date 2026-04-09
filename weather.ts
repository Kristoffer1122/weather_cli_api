import chalk from "chalk"
// @ts-ignore
import asciiart from "./weather_ascii.json" assert { type: "json" };
const API_URL: string = 'https://api.open-meteo.com/v1/forecast?latitude=59.9127&longitude=10.7461&daily=sunrise,sunset,weather_code,uv_index_max&hourly=temperature_2m,snowfall,rain,cloud_cover,apparent_temperature&current=temperature_2m,apparent_temperature,rain,snowfall&timezone=Europe%2FBerlin&forecast_days=1'

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

async function fetchWeatherPrev() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();


        let snowy_flag = false;
        let rainy_flag = false;
        let cloudy_flag = false;

        // Gives us Morning, Afternoon, Evening, Night
        let hours = [8, 14, 20, 2]
        // we will populate this with the states, so if its snowy, rainy, cloudy or sunny for each of the 4 time periods
        let states = { 8: { snowy: true, rainy: false, cloudy: false }, 14: { snowy: false, rainy: true, cloudy: false }, 20: { snowy: false, rainy: false, cloudy: true }, 2: { snowy: false, rainy: false, cloudy: false } };
        let temperatures: string[] = ['5', '12', '15', '8'];

        // Dummy data - comment out below for real data
        /*
        hours.filter((e) => {
            temperatures.push(data.hourly.temperature_2m[e])

            if (data.hourly.snowfall[e] > 20) {
                states[e].snowy = true;
                snowy_flag = true;
            }

            if (data.hourly.rain[e] > 20) {
                states[e].rainy = true;
                rainy_flag = true;
            }

            if (data.hourly.cloud_cover[e] > 50) {
                states[e].cloudy = true;
                cloudy_flag = true;
            }
        });
        */

        const terminalSize = getTerminalSize();

        // Get the number of lines in ASCII art
        const artLines = asciiArt[terminalSize].sunny.length;

        // Print header with hours and temperatures
        const artWidth = asciiArt[terminalSize].sunny[0].length;
        const header = hours.map((hour, i) => {
            const timeText = formatHourTo12Hour(hour);
            const tempText = ` ${temperatures[i]}°C`;
            const combined = (timeText + tempText).padEnd(artWidth);
            return chalk.bold.white(timeText) + chalk.bold.yellow(tempText) + ' '.repeat(artWidth - timeText.length - tempText.length);
        }).join('  ');
        console.log(header);

        // Print each line of ASCII art horizontally
        for (let lineIndex = 0; lineIndex < artLines; lineIndex++) {
            const lineSegments = hours.map((hour) => {
                let artLine = '';
                if (states[hour].snowy) {
                    artLine = chalk.white(asciiArt[terminalSize].snowy[lineIndex]);
                } else if (states[hour].rainy) {
                    artLine = chalk.cyan(asciiArt[terminalSize].rainy[lineIndex]);
                } else if (states[hour].cloudy) {
                    artLine = chalk.gray(asciiArt[terminalSize].cloudy[lineIndex]);
                } else {
                    artLine = chalk.yellow(asciiArt[terminalSize].sunny[lineIndex]);
                }
                return artLine;
            });
            console.log(lineSegments.join('  '));
        }

    }
    catch (error) {
        console.error('Error fetching weather data for next 12 hours:', error);
    }
}


// Helper function to convert 12-hour time format to 24-hour format
function formatHourTo12Hour(time: number): string {
    let hour = time % 24;
    const minute = '00';
    const ampm = hour >= 12 ? 'PM' : 'AM';

    // Convert hour to 12-hour format
    hour = hour % 12;
    hour = hour ? hour : 12;

    // Convert based on AM/PM
    if (ampm === 'AM' && hour === 12) {
        hour = 0;
    } else if (ampm === 'PM' && hour !== 12) {
        hour += 12;
    }

    // Return the formatted time
    return `${hour}:${minute.slice(0, 2)} `;
}

fetchWeatherPrev()
