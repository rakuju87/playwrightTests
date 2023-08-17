import { test, expect, APIRequestContext } from '@playwright/test';
import { ApiActions } from '../actions/apiActions';
import { AustratianCapitalCity } from '../testdata/AustratianCapitalCity';
import { CurrentWeatherResponse } from '../models/response/currentWeather';
let request: APIRequestContext;
let apiActions: ApiActions;
let currentWeatherResponse: CurrentWeatherResponse[];
test.describe.serial(`WeatherBitAPI - warmest Australian capital city`, async () => {
    test.beforeAll(async ({ browser }) => {
        request = (await browser.newContext()).request;
        apiActions = new ApiActions(request);
    });
    test(`Get current weather data for all capital city`, async () => {
        currentWeatherResponse = [];
        //Parallel
        await Promise.all(AustratianCapitalCity.map(async (city) => {
            currentWeatherResponse.push(await apiActions.currentWeatherDataByCity(city, 'AU'));
        }));
        //Sequence
        // for (const city of AustratianCapitalCity) {
        //     currentWeatherResponse.push(await apiActions.currentWeatherDataByCity(city, 'AU'));
        // }
    });
    test(`Verify the warmest city`, async () => {
        let warmestCity: { city: string; temp: number; };
        warmestCity = await apiActions.getWarmestCity(currentWeatherResponse);
        console.log(`Warmest australian capital city - ${warmestCity.city} with temp - ${warmestCity.temp}`);
    });
});