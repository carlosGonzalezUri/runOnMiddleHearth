import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.scss'],
})
export class TutorialComponent  implements OnInit {
  @Output() closeTutorial = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {}

  public close() {
    this.closeTutorial.emit();
  }

}
