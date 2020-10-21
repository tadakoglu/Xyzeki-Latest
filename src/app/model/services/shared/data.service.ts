import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject, Subject, ReplaySubject, Observable } from 'rxjs';


@Injectable()
export class DataService {

  public removeTeamMemberEvent: EventEmitter<number> = new EventEmitter();

  public newSwitchDayEvent: Subject<string> = new ReplaySubject<string>(1);
  public newDeepSearchEvent: EventEmitter<string> = new EventEmitter();

  public newContainerSearchEvent: EventEmitter<string> = new EventEmitter();
  public newContainerBlobSearchEvent: EventEmitter<string> = new EventEmitter();

  public ledTypeClassShared = "led-yellow"
  public ledToolTipMessage = 'Sarı ışık: sürükle bırak işlevi hem başlangıç hem de teslim için atama yapar.'

  public switchMode: number = 0; // Giden, Gelen 0 ; Giden 1; Gelen 2
  openPrivateTalkId: number

  saveChangesEvent: EventEmitter<[string[], number[]]> = new EventEmitter();

  public loadAllRepositoriesEvent: EventEmitter<void> = new EventEmitter();
  public clearAllRepositoriesEvent: EventEmitter<void> = new EventEmitter();


  public signalConnectionSeconds: EventEmitter<number> = new EventEmitter();
  public startSignalConnection: EventEmitter<void> = new EventEmitter();


  public refreshTokenSubject: Subject<any> = new BehaviorSubject<any>(null);

  constructor() { }

}