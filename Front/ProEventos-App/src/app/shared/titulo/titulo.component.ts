import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-titulo',
  templateUrl: './titulo.component.html',
  styleUrls: ['./titulo.component.scss']
})
export class TituloComponent implements OnInit {

  //o Input serve para que o valor possa ser inserido por outras classes do código
  @Input() titulo!: string;

  constructor() { }

  ngOnInit() {
  }

}
