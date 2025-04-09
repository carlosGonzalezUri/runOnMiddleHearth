import { Injectable } from '@angular/core';
import { LOCAL_STORAGE } from './commons/commons.constants';
import { UtilsService } from './utils.service';
import { IUserData, IUserSession, StravaActivity } from './commons/commons.interface';


@Injectable({
  providedIn: 'root'
})
export class StravaService {

  constructor(
    private us: UtilsService
  ) { }

  public goToStravaPageToLogin() {//#strava-step 2 go to strava, login and open APP
    location.href = 'http://www.strava.com/oauth/authorize' 
      + '?client_id=' + this.getClientId()
      + '&response_type=code&redirect_uri=' + this.getRedirectUrl()
      + '&approval_prompt=force&scope=activity:read_all';
  }

  public async openAppWithCodeOnUrl() {//#
    const stravaAPICode = await this.getCodeFromUrl(window.location.href);
    window.location.href = 'caminoxrutaepica://home?token=' +stravaAPICode + '&scope';
  }

  public async getUserAccessToken(code: string): Promise<void> {
    const headers = this.getHeaders();
    const body = this.getBody(code);

    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'post',
      "headers": headers,
      body
    });

    const responseJson = await response.json();

    this.saveDataResponse(responseJson);
  }

  public async saveNoCaducableAccessToken(): Promise<any> {
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
    localStorage.setItem(LOCAL_STORAGE.stravaAccessToken, responseJson.access_token);
  }

  public async getUserStravaActivities(): Promise<any> {
    const token = localStorage.getItem(LOCAL_STORAGE.stravaAccessToken) || 'token';
    const from = this.getEpochInitDate();
    const stravActivities = await this.getStravaAtivities(token, from);

    return stravActivities;
  }

  private async getStravaAtivities(token: string, from: string, page = 1, activities?:any): Promise<any> {
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
      + '&after=' + this.dateToUnixTimestamp(new Date(from))  //desde
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

  private dateToUnixTimestamp(date: Date): number {
    return Math.floor(date.getTime() / 1000); // Convierte de milisegundos a segundos
  }

  public formatActivities(activities: StravaActivity[]): IUserSession[] {
    let activitiesList: IUserSession[] = []

    activities.forEach((track: StravaActivity, index: number) => {
      activitiesList.push(
        {
          date: new Date(track.start_date),
          steps: this.us.getStepsFromMeters(track.distance),
          meters: track.distance
        }
      )
    });
    return activitiesList;
  }

  private getEpochInitDate(): string {
    const userData: IUserData = this.us.getLS(LOCAL_STORAGE.userData);
    return userData.initDate.toString();
  }

  private saveDataResponse(userTokensResponse: any) {
    localStorage.setItem('token', userTokensResponse.access_token);
    localStorage.setItem('refresh_token', userTokensResponse.refresh_token);
    localStorage.setItem('refresh_token', userTokensResponse.refresh_token);
    localStorage.setItem('userId', userTokensResponse?.athlete.id);
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

  private getRedirectUrl(): string {////#strava-step 3 open APP with token on url [URL is captured in index.html script on URL_FROM]
    return 'https://camino-x-ruta-epica.firebaseapp.com';
  }

  private getCodeFromUrl(stringUrl: any) { //get app from redirect from STRAVA
    return stringUrl.substring(
      stringUrl.indexOf('code') + 'code.'.length,
      stringUrl.indexOf('&scope')
    );
  }

}
