import { test, expect, APIRequestContext } from '@playwright/test';
import { ApiActions } from '../actions/apiActions';
import { CurrentWeatherDataCity } from '../testdata/currentWeatherDataCity';
import { CurrentWeatherResponse } from '../models/response/currentWeather';
let request: APIRequestContext;
let apiActions: ApiActions;
let currentWeatherResponse: CurrentWeatherResponse;
CurrentWeatherDataCity.forEach(data => {
  test.describe.serial(`WeatherBitAPI - Current weather ${data.city}`, async () => {
    test.beforeAll(async ({ browser }) => {
      request = (await browser.newContext()).request;
      apiActions = new ApiActions(request);
    });
    test(`Get current weather data`, async () => {
      currentWeatherResponse = await apiActions.currentWeatherDataByCity(data.city, data.country);
    });
    test(`Check temp is more than ${data.temp}`, async () => {
      expect(currentWeatherResponse.data[0].temp).toBeGreaterThan(data.temp);
    });
    test(`Check snow is less than or equal to ${data.snow}`, async () => {
      expect(currentWeatherResponse.data[0].snow).toBeLessThanOrEqual(data.snow);
    });
    test(`Check precipitation is less than or equal to ${data.snow}`, async () => {
      expect(currentWeatherResponse.data[0].precip).toBeLessThanOrEqual(data.precip);
    });
  });
});