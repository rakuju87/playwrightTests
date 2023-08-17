import { APIRequestContext, expect } from '@playwright/test';
import { url } from '../config/api';
import { CurrentWeatherResponse } from '../models/response/currentWeather';
import fs from "fs";
import { parse } from "csv-parse";
import zlib from 'zlib';
let currentWeatherResponse: CurrentWeatherResponse;
export class ApiActions {
    readonly request: APIRequestContext;
    constructor(request: APIRequestContext) {
        this.request = request;
    }
    async currentWeatherDataByLatLong(lat: number, long: number) {
        var params = { 'key': process.env.apiKey == undefined ? "" : process.env.apiKey, 'lat': lat, 'lon': long }
        const response = await this.requestGet(`${url.currentWeather}`, params);
        expect(response.status()).toEqual(200);
        currentWeatherResponse = await response.json();
        return currentWeatherResponse;
    }
    async currentWeatherDataByCity(city: string, country: string) {
        var params = { 'key': process.env.apiKey == undefined ? "" : process.env.apiKey, 'city': city, 'country': country }
        const response = await this.requestGet(`${url.currentWeather}`, params);
        expect(response.status()).toEqual(200);
        currentWeatherResponse = await response.json();
        return currentWeatherResponse;
    }
    async currentWeatherBulkFile() {
        const writeStream = fs.createWriteStream('current.csv.gz');
        var params = { 'key': process.env.apiKey == undefined ? "" : process.env.apiKey }
        const response = await this.requestGet(`${url.bulkFile}`, params);
        expect(response.status()).toEqual(200);
        writeStream.write(await response.body());
        writeStream.end();
    }
    async getWarmestCity(weatherResponse: CurrentWeatherResponse[]) {
        var tempArr: { city: string; temp: number; }[];
        tempArr = [];
        weatherResponse.forEach(async weatherData => {
            tempArr.push({ city: weatherData.data[0].city_name, temp: weatherData.data[0].temp });
        });
        tempArr.sort(function (a, b) { return b.temp - a.temp });
        return tempArr[0];
    }
    async getColdestCity(weatherResponse: CurrentWeatherResponse[]) {
        var tempArr: { city: string; temp: number; }[];
        tempArr = [];
        weatherResponse.forEach(async weatherData => {
            tempArr.push({ city: weatherData.data[0].city_name, temp: weatherData.data[0].temp });
        });
        tempArr.sort(function (a, b) { return a.temp - b.temp });
        return tempArr[0];
    }
    async getUSCities() {
        let usCities: string[];
        usCities = [];
        return new Promise<string[]>(resolve => {
            fs.createReadStream("./testdata/cities_all.csv").pipe(parse({
                delimiter: ",",
                columns: true,
                ltrim: true,
            })).on("data", function (row) {
                if (row.country_code == 'US') {
                    usCities.push(row.city_name);
                }
            }).on('end', () => {
                resolve(usCities)
            });
        });
    }
    async getUSCityID() {
        let usCitiesId: [{ city: string, cityID: number }];
        return new Promise<[{ city: string, cityID: number }]>(resolve => {
            fs.createReadStream("./testdata/cities_all.csv").pipe(parse({
                delimiter: ",",
                columns: true,
                ltrim: true,
            })).on("data", function (row) {
                if (row.country_code == 'US') {
                    usCitiesId.push({ city: row.city_name, cityID: row.city_id });
                }
            }).on('end', () => {
                resolve(usCitiesId);
            });
        });
    }

    async getCityAndTempFromBulkFile(usCityID: { city: string; cityID: number; }[]) {
        let usCitiesTemp: [{ city: string; temp: number; }];
        return new Promise<[{ city: string, temp: number }]>(resolve => {
            fs.createReadStream('current.csv.gz')
                .pipe(zlib.createUnzip())
                .pipe(parse({
                    delimiter: ",",
                    columns: true,
                    ltrim: true,
                }))
                .on('data', async function (row) {
                    for (let i = 0; i < usCityID.length; i++) {
                        if (row["Location ID"] == usCityID[i].cityID) {
                            usCitiesTemp.push({ city: usCityID[i].city, temp: row["Temperature (C)"] });
                            break;
                        }
                    }
                }).on('end', async function () {
                    resolve(usCitiesTemp);
                });
        });
    }
    async getColdestUSCity(coldestCities: [{ city: string, temp: number }]) {
        var tempArr: { city: string; temp: number; }[];
        tempArr = [];
        coldestCities.forEach(async weatherData => {
            tempArr.push({ city: weatherData.city, temp: weatherData.temp });
        });
        tempArr.sort(function (a, b) { return a.temp - b.temp });
        return tempArr[0];
    }
    async resize(arr: string[], size: number) {
        let resizedArr: string[];
        resizedArr = [];
        while (size > 0) {
            resizedArr.push(arr[size]);
            size--;
        }
        return resizedArr;
    }
    async requestGet(url: string, params: { [key: string]: string | number | boolean }) {
        const response = await this.request.get(url, {
            params: params
        });
        return response;
    }
}