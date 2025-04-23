const API_URL: string = 'https://api.open-meteo.com/v1/forecast?latitude=59.9127&longitude=10.7461&daily=sunrise,sunset,weather_code,uv_index_max&hourly=temperature_2m,snowfall,rain,cloud_cover,apparent_temperature&current=temperature_2m,apparent_temperature,rain,snowfall&timezone=Europe%2FBerlin&forecast_days=1'

// grunnen til att alle arrays er paa samme er fordi det teller timen av dagen
async function fetchWeather(): Promise<void> {
	try {
		const response = await fetch(API_URL);

		if (!response.ok) {
			throw new Error(`Error: ${response.status}`);
		}
		const data = await response.json();

		// finne dagens dato og synkronisere apien med det
		const currentHour = new Date().toLocaleString().slice(10)
		const time24hr = convertTo24HourFormat(currentHour);
		const hourDecider = time24hr.slice(0, 2)

		const currentWeather = checkWeather(Math.floor(data.hourly.temperature_2m[hourDecider]));
		const apparentWeather = checkWeather(Math.floor(data.hourly.apparent_temperature[hourDecider]));

		const tempUnits = data.hourly_units.temperature_2m;
		const actualTemps = `Været i Oslo kl ${time24hr}${data.hourly.temperature_2m[hourDecider] + tempUnits + currentWeather}`;
		const apparentTemps = `Føles som ${data.hourly.apparent_temperature[hourDecider] + tempUnits + apparentWeather}`;

		const output = `----------------------------\n${actualTemps}\n${apparentTemps}\n----------------------------`;
		console.log(output);
	} catch (error) {
		console.error('Failed to fetch weather data:', error);
	}
}

function checkWeather(temp: number, clouds?: number, uv?: number, rain?: number, snow?: number,) {
	if (temp <= 0) return "🥶";
	if (temp <= 10) return "🧥";
	if (temp <= 20) return "😎";
	if (temp <= 30) return "🔥";
	if (clouds <= 75) return "🌧️";
	if (clouds <= 40) return "🌥️";
	if (clouds <= 10) return "☀️";
	if (uv) return `${uv} i uv`;
	if (rain >= 2) return "det regner"
	if (snow >= 2) return "det snør"
};

function convertTo24HourFormat(time) {
	// Extract hour, minute, and AM/PM
	let [hour, minute] = time.split(':');
	const ampm = time.slice(-2); // Get AM/PM
	hour = parseInt(hour); // Convert hour to number

	// Convert based on AM/PM
	if (ampm === 'AM' && hour === 12) {
		hour = 0; // 12 AM is 00 in 24-hour format
	} else if (ampm === 'PM' && hour !== 12) {
		hour += 12; // Convert PM times to 24-hour format
	}

	// Return the formatted time
	return `${hour}:${minute.slice(0, 2)} `;
}

fetchWeather();
