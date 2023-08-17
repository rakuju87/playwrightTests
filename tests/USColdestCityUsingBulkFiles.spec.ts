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
        // await apiActions.currentWeatherBulkFile();
    });
    test(`Verify the coldest city`, async () => {
        let coldestCities: [{ city: string, temp: number }];
        coldestCities = await apiActions.getCityAndTempFromBulkFile(await apiActions.getUSCityID());
        const coldestCity = await apiActions.getColdestUSCity(coldestCities);
        console.log(`Coldest US capital city - ${coldestCity.city} with temp - ${coldestCity.temp}`);
    });
});