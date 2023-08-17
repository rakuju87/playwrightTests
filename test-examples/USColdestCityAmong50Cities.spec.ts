import { test, expect, APIRequestContext } from '@playwright/test';
import { ApiActions } from '../actions/apiActions';
import { CurrentWeatherResponse } from '../models/response/currentWeather';
let request: APIRequestContext;
let apiActions: ApiActions;
let currentWeatherResponse: CurrentWeatherResponse[];
test.describe.serial(`WeatherBitAPI - coldest US capital city`, async () => {
    test.beforeAll(async ({ browser }) => {
        request = (await browser.newContext()).request;
        apiActions = new ApiActions(request);
    });
    test(`Get current weather data for 50 US cities`, async () => {
        currentWeatherResponse = [];
        const usCities = await apiActions.resize(await apiActions.getUSCities(), 50);
        await Promise.all(usCities.map(async (city) => {
            currentWeatherResponse.push(await apiActions.currentWeatherDataByCity(city, 'US'));
        }));
    });
    test(`Verify the coldest city`, async () => {
        let coldestCity: { city: string; temp: number; };
        coldestCity = await apiActions.getColdestCity(currentWeatherResponse);
        console.log(`Coldest US capital city - ${coldestCity.city} with temp - ${coldestCity.temp}`);
    });
});
