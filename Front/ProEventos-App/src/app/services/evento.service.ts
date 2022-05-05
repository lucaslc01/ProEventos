import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Evento } from '../models/Evento';

@Injectable(
  //Decorator do tipo Injectable que me permite injetar esta classe em qualquer outra classe do código. Esta é uma das formas de se injetar uma classe.
   //{ providedIn: 'root' }
)

export class EventoService {
  baseURL = 'https://localhost:5001/api/eventos';

  constructor(private http: HttpClient) { }

  //para poder usar o subscribe em uma função, é necessário declarar a função a ser consultada abaxio como do tipo Observable para que seja
  //possível se inscrever nela.
  public getEventos(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.baseURL);
  }

  public getEventosByTema(tema: string): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.baseURL}/${tema}/tema`);
  }

  public getEventoById(id: number): Observable<Evento> {
    return this.http.get<Evento>(`${this.baseURL}/${id}`);
  }
}
