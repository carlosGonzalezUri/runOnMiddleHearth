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
  
  private async initStravaFlow() { //#strava-step 0 - user select strava, then login on strava
    this.stravaService.goToStravaPageToLogin();
  }

}
