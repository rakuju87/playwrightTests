import { APIRequestContext, expect } from '@playwright/test';
import { url } from '../config/api';
import { CurrentWeatherResponse } from '../models/response/currentWeather';
import { Helper } from '../support/helper';
import fs from "fs";
let currentWeatherResponse: CurrentWeatherResponse;

export class ApiActions {
    readonly request: APIRequestContext;
    readonly helper: Helper;
    constructor(request: APIRequestContext) {
        this.request = request;
        this.helper = new Helper();
    }
    async currentWeatherDataByLatLong(lat: number, long: number) {
        var params = { 'key': process.env.APIKEY == undefined ? "" : process.env.APIKEY, 'lat': lat, 'lon': long }
        const response = await this.requestGet(`${url.currentWeather}`, params);
        expect(response.status()).toEqual(200);
        currentWeatherResponse = await response.json();
        return currentWeatherResponse;
    }
    async currentWeatherDataByCity(city: string, country: string) {
        var params = { 'key': process.env.APIKEY == undefined ? "" : process.env.APIKEY, 'city': city, 'country': country }
        const response = await this.requestGet(`${url.currentWeather}`, params);
        expect(response.status()).toEqual(200);
        currentWeatherResponse = await response.json();
        return currentWeatherResponse;
    }
    async currentWeatherBulkFile() {
        const writeStream = fs.createWriteStream('current.csv.gz');
        var params = { 'key': process.env.APIKEY == undefined ? "" : process.env.APIKEY }
        const response = await this.requestGet(`${url.bulkFile}`, params);
        expect(response.status()).toEqual(200);
        writeStream.write(await response.body());
        writeStream.end();
    }
    async getColdestUSCity() {
        let coldestCities: [{ city: string, temp: number }];
        let usCityID: [{ city: string; cityID: string; }];
        usCityID = await this.helper.getUSCityID();
        coldestCities = await this.helper.getCityAndTempFromBulkFile(usCityID);
        return (await this.helper.getColdestUSCity(coldestCities));
    }
    async getWarmestAUCity(currentWeatherResponse: CurrentWeatherResponse[]){
        return(await this.helper.getWarmestCity(currentWeatherResponse));
    }
    async requestGet(url: string, params: { [key: string]: string | number | boolean }) {
        const response = await this.request.get(url, {
            params: params
        });
        return response;
    }
}