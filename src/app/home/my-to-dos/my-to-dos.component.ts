import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-my-to-dos',
  templateUrl: './my-to-dos.component.html',
  styleUrls: ['./my-to-dos.component.css'],
  changeDetection: ChangeDetectionStrategy.Default})
export class MyToDosComponent implements OnInit {
  ngOnInit(): void {
   
  }  

}

