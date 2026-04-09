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
  
async function fetchWeather() {
	try {
		const response = await fetch(API_URL);
		const data = await response.json();

		// Get current hour
		const currentHour = new Date().getHours();

		// Extract current temperature and apparent temperature
		const currentTemperature = data.hourly.temperature_2m[currentHour];
		const currentApparentTemperature = data.hourly.apparent_temperature[currentHour];

		// Display current weather with padding for alignment
		console.log(`Ute nå: ${currentTemperature}°C, Føles som: ${currentApparentTemperature}°C`);

	} catch (error) {
		console.error('Error fetching weather data:', error);
	}
	await fetchWeatherPrev();
}

async function fetchWeatherPrev() {
	try {
		const response = await fetch(API_URL);
		const data = await response.json();

		// Get current hour
		const currentHour = new Date().getHours();

		console.log('\nVæret for de siste 3 og neste 3 timene:');

		// Loop through the previous 3 and next 3 hours
		for (let i = currentHour - 3; i <= currentHour + 3; i++) {
			if (i < 0 || i >= data.hourly.temperature_2m.length) continue; // Skip out-of-bounds hours

			// Extract hour, temperature, and apparent temperature
			const hour = i % 24; // Wrap around using modulo
			const temperature = data.hourly.temperature_2m[hour];
			const apparentTemperature = data.hourly.apparent_temperature[hour];

			// Format hour to 12-hour format
			const formattedHour = formatHourTo12Hour(hour);

			// if snowfall or rain is greater than 0, add a snowflake or raindrop icon
			const snowfall = data.hourly.snowfall[hour];
			const rain = data.hourly.rain[hour];
			if (snowfall > 0) {
				console.log('❄️');
			} else if (rain > 0) {
				console.log('💧');
			}
			// Display the weather data
			console.log(`${formattedHour} - Temp: ${temperature}°C, Føles som: ${apparentTemperature}°C`);
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
	hour = hour ? hour : 12; // the hour '0' should be '12'

	// Convert based on AM/PM
	if (ampm === 'AM' && hour === 12) {
		hour = 0; // 12 AM is 00 in 24-hour format
	} else if (ampm === 'PM' && hour !== 12) {
		hour += 12; // Convert PM times to 24-hour format
	}

	// Return the formatted time
	return `${hour}:${minute.slice(0, 2)} `;
}

fetchWeatherPrev()
