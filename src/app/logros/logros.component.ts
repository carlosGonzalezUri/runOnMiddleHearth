import { Component, Input, OnInit } from '@angular/core';
import recorrido from '../../assets/data/eventsMordor.json';
import { Iliterals, IUbicacion } from '../commons/commons.interface';


@Component({
  selector: 'app-logros',
  templateUrl: './logros.component.html',
  styleUrls: ['./logros.component.scss'],
  standalone: false,
})
export class LogrosComponent {
  @Input() set currentLogrosNumber(logros: number) {
    this._currentLogrosNumber = logros;
    this.setprogressList();
  }
  @Input() LITERALS!: Iliterals;

  public recorrido = recorrido;
  public progressList: IUbicacion[] = [];

  private _currentLogrosNumber!: number;

  constructor() { }

  public getBackgroundImg(index: number) {
    return "../../assets/images/ubi"+index+".png";
  }

  private setprogressList(): void {
    this.progressList = [];
    for(let i=0; i<this._currentLogrosNumber; i++) {
     this.progressList.push(recorrido.recorrido[i])
    }
  }

}
