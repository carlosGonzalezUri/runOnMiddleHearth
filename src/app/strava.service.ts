import { Injectable } from '@angular/core';
import { LOCAL_STORAGE } from './commons/commons.constants';
import { UtilsService } from './utils.service';
import { IUserData } from './commons/commons.interface';


@Injectable({
  providedIn: 'root'
})
export class StravaService {

  constructor(
    private us: UtilsService
  ) { }

  public goToStravaPageToAskForCodeFirstTime() {
    location.href = 'http://www.strava.com/oauth/authorize' 
      + '?client_id=' + this.getClientId()
      + '&response_type=code&redirect_uri=' + this.getRedirectUrl()
      + '&approval_prompt=force&scope=activity:read_all';
  }

  public async getAccessToken(): Promise<any> {
    const response = await fetch('https://www.strava.com/oauth/token'
      +'?client_id=' + this.getClientId()
      +'&client_secret=' + this.getClientSecret()
      +'&refresh_token=' + this.getRefreshToken()
      + '&grant_type=refresh_token', {
        method: 'post',
        "headers": this.getHeaders()
      }
    );

    const responseJson = await response.json();
    localStorage.setItem('token', responseJson.access_token);

    return responseJson;
  }

  public initFlow(): Promise<void> {
    if (this.userHasRefresToken()) {
      this.setUserDataOnLS();
      return Promise.resolve();
    }

    if (this.comesFromObtainCode()) {
      this.setCodeFromUrl();
      return Promise.resolve();
    }

    this.goToStravaPageToAskForCodeFirstTime();
    return Promise.resolve();
  }

  private async setCodeFromUrl() {
    const stringUrl = window.localStorage.getItem('URL_FROM');
    const code = this.getCodeFromUrl(stringUrl);
    await this.getAccessTokenWithCode(code);
  }

  public async getAccessTokenWithCode(code: string): Promise<string> {
    const headers = this.getHeaders();
    const body = this.getBody(code);

    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'post',
      "headers": headers,
      body
    });

    const responseJson = await response.json();

    this.saveDataResponse(responseJson);

    return responseJson.access_token;
  }

  private async setUserDataOnLS() {
    const token = localStorage.getItem('token') || 'token';
    const from = this.getEpochInitDate();
    const stravActivities = await this.getStravaAtivities(token, from);
    // activitiesList = this.us.mapActivities(stravActivities);
  }

  public async getStravaAtivities(token: string, from: string, page = 1, activities?:any): Promise<any> {
    let responsesDeposit: any[] = [];
    if (page === 1) {
      responsesDeposit = [];
    }
    //https://www.epochconverter.com/
    const newDateAsInitDate = new Date();
    newDateAsInitDate.setDate(newDateAsInitDate.getDate() +1);
    newDateAsInitDate.setHours(23,59,0,0);
    const MAX_ACTIVITIES = 100;

    const epochTimeTomorrow = newDateAsInitDate.getTime().toString().slice(0, -3);

    const response = await fetch('https://www.strava.com/api/v3/athlete/activities'
      + '?before=' + epochTimeTomorrow //hasta
      + '&after=' + from  //desde
      + '&per_page=' + MAX_ACTIVITIES //max
      + '&page=' + page //1 is default
      + '&access_token=' + token);

    let responseJson = await response.json();
    responsesDeposit = responsesDeposit.concat(responseJson);

    if (responseJson.length === MAX_ACTIVITIES) {
      await this.getStravaAtivities(token, from, page+1, responseJson);
    }

    return responsesDeposit;
  }

  private getEpochInitDate(): string {
    const userData: IUserData = this.us.getLS(LOCAL_STORAGE.userData);
    return userData.initDate.toString();
  }

  private saveDataResponse(userTokensResponse: any) {
    localStorage.setItem('token', userTokensResponse.access_token);
    localStorage.setItem('refresh_token', userTokensResponse.refresh_token);
    localStorage.setItem('userId', userTokensResponse?.athlete.id);
  }

  private comesFromObtainCode(): boolean | undefined {
    return window.localStorage.getItem('URL_FROM')?.includes('code');
  }

  private userHasRefresToken() {
    return Boolean(localStorage.getItem('refresh_token'));
  }

  private getClientId(): string {
    return '120714'
  }

  private getClientSecret() {
    return '75a1342ffce7002d3e315254a5a938bdf6ec7d87';
  }

  private getRefreshToken(): string {
    return localStorage.getItem('refresh_token')?.toString() || '';
  }

  private getHeaders() {
    return {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    }
  }

  private getBody(code: string) {
    return JSON.stringify({
      client_id : this.getClientId(),
      client_secret: this.getClientSecret(),
      code: code
    });
  }

  private getRedirectUrl(): string {
    return 'https://camino-x-ruta-epica.web.app/data';
  }

  //WEB FLOW
  public async getCodeFromUrlAndOpenAPP() {
    const code = this.getCodeFromUrl(window.location.href);
    // window.location.href = 'epicroutes://data?code=' + code + '&scope'; //TODO CHANGE
    // await AppLauncher.openUrl({ url: 'running.steps.epic://home?code='+code+'&scope'});
  }

  private getCodeFromUrl(stringUrl: any) {
    return stringUrl.substring(
      stringUrl.indexOf('code') + 'code.'.length,
      stringUrl.indexOf('&scope')
    );
  }
}
