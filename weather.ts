const API_URL: string = 'https://api.open-meteo.com/v1/forecast?latitude=59.9127&longitude=10.7461&daily=sunrise,sunset,weather_code,uv_index_max&hourly=temperature_2m,snowfall,rain,cloud_cover,apparent_temperature&current=temperature_2m,apparent_temperature,rain,snowfall&timezone=Europe%2FBerlin&forecast_days=1'

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

        const bracket = "|"

        // Get current hour
        const currentHour = new Date().getHours();

        console.log(" ------------------- ");
        console.log(" | KL     | Temp   | ")

        // Loop through the previous 3 and next 3 hours
        for (let i = currentHour - 3; i <= currentHour + 3; i++) {
            if (i < 0 || i >= data.hourly.temperature_2m.length) continue;

            // Extract hour, temperature, and apparent temperature
            const hour = i % 24;
            let temperature = data.hourly.temperature_2m[hour];
            const apparentTemperature = data.hourly.apparent_temperature[hour];

            // Format hour to 12-hour format
            let formattedHour = formatHourTo12Hour(hour);

            // if snowfall or rain is greater than 0, add a snowflake or raindrop icon
            const snowfall = data.hourly.snowfall[hour];
            const rain = data.hourly.rain[hour];
            if (snowfall > 0) {
                console.log('❄️');
            } else if (rain > 0) {
                console.log('💧');
            }

            if (formattedHour.length <= 5) {
                formattedHour = " " + formattedHour;
            }

            if (temperature.toString().length <= 1) {
                temperature = " " + temperature + ".0";
            } else if (temperature.toString().length <= 2) {
                temperature = temperature + ".0";
            } else if (temperature.toString().length <= 3) {

                temperature = " " + temperature;

            } else if (temperature.toString().length <= 4) {
                // temperature = " " + temperature;

            }

            // Display the weather data
            console.log(` | ${formattedHour} | ${temperature}°C |`);
        }

        console.log(" ------------------- ");
    }
    catch (error) {
        console.error('Error fetching weather data for next 12 hours:', error);
    }
}


class Layout {

    day: string;
    temperature: number;


    constructor(day: string, temperature: number) {

        this.day = day;
        this.temperature = temperature

        console.log(`
	|	     ${this.day}		|
	|					|
	|   Temperature: ${this.temperature}	|
	|					|
	|					|
	|					|
	|					|
`)

    }

}

const formatWeather = () => {

    console.log(new Layout("Monday", 15))


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

fetchWeather();
