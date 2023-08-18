import { test, expect, APIRequestContext } from '@playwright/test';
import { ApiActions } from '../actions/apiActions';
let request: APIRequestContext;
let apiActions: ApiActions;
test.describe.serial(`WeatherBitAPI - warmest Australian capital city`, async () => {
    test.beforeAll(async ({ browser }) => {
        request = (await browser.newContext()).request;
        apiActions = new ApiActions(request);
    });
    test(`Get current weather data for all capital city`, async () => {
        await apiActions.currentWeatherBulkFile();
    });
    test(`Verify the coldest city`, async () => {
        const coldestCity = await apiActions.getColdestUSCity();
        console.log(`Coldest US city - ${coldestCity.city} with temp - ${coldestCity.temp}`);
    });
});