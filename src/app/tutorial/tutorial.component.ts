import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UtilsService } from '../utils.service';
import { LOCAL_STORAGE } from '../commons/commons.constants';
import { UrlHandlingStrategy } from '@angular/router';
import { StravaService } from '../strava.service';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.scss'],
})
export class TutorialComponent  implements OnInit {
  @Output() closeTutorial = new EventEmitter<void>();

  constructor(
    private us: UtilsService,
    private stravaService: StravaService
  ) { }

  ngOnInit() {}

  public close(mode: string) {
    this.us.setLS(LOCAL_STORAGE.insertDataMode, mode);

    if (mode === 'manual') {
      this.closeTutorial.emit();
      return;
    }

    if (mode === 'strava') {
      this.initStravaFlow();
    }
  }
  
  private async initStravaFlow() {
    this.stravaService.goToStravaPageToAskForCodeFirstTime();
    // await this.stravaService.getAccessToken();
    // go to strava page and ask for code
    // ---- this web should ask for code and then open the app with code on url
    // come back and catch the code from UrlHandlingStrategy

    // with code ask for sessions
    // formats strava sessions to iusersessions
    // save user sessions on LC
    // emit close tutorial
  }

}
