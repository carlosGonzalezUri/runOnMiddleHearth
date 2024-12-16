import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StravaService {

  constructor() { }

  public goToStravaPageToAskForCodeFirstTime() {
    location.href = 'http://www.strava.com/oauth/authorize' 
      + '?client_id=' + this.getClientId()
      + '&response_type=code&redirect_uri=' + this.getRedirectUrl()
      + '&approval_prompt=force&scope=activity:read_all';
  }

  private getRedirectUrl(): string {
    return 'https://corriendoporrutaepica.firebaseapp.com/data';
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
}
