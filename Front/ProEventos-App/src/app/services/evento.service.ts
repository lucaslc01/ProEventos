import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Evento } from '../models/Evento';
import { take, map } from 'rxjs/operators';
import { PaginatedResult } from '@app/models/Pagination';

@Injectable(
  //Decorator do tipo Injectable que me permite injetar esta classe em qualquer outra classe do código. Esta é uma das formas de se injetar uma classe.
   //{ providedIn: 'root' }
)

export class EventoService {
  baseURL = 'https://localhost:5001/api/eventos';

  constructor(private http: HttpClient) { }

  //para poder usar o subscribe em uma função, é necessário declarar a função a ser consultada abaixo como do tipo Observable para que seja
  //possível se inscrever nela (acompanhar a função durante a execução).
  public getEventos(page?: number, itemsPerPage?: number, term?: string): Observable<PaginatedResult<Evento[]>> {

    const paginatedResult: PaginatedResult<Evento[]> = new PaginatedResult<Evento[]>();

    let params = new HttpParams;

    //
    if(page != null && itemsPerPage != null){
      params = params.append('pageNumber', page.toString());
      params = params.append('pageSize', itemsPerPage.toString());
    }

    if(term != null && term != ''){
      params = params.append('term', term)
    }

    return this.http.get<Evento[]>(this.baseURL, {observe: 'response', params})
            .pipe(take(1), //o take realiza a chamada do observable 1 vez e desinscreve automaticamente do observable.
            map((response) => {
              paginatedResult.result = response.body;
              if(response.headers.has('Pagination')) {
                paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
              }
              return paginatedResult;
            }));

  }

  public getEventosByTema(tema: string): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.baseURL}/${tema}/tema`).pipe(take(1));
  }

  public getEventoById(id: number): Observable<Evento> {
    return this.http.get<Evento>(`${this.baseURL}/${id}`).pipe(take(1));
  }

  public post(evento: Evento): Observable<Evento> {
    return this.http.post<Evento>(this.baseURL, evento).pipe(take(1));
  }

  public put(evento: Evento): Observable<Evento> {
    return this.http.put<Evento>(`${this.baseURL}/${evento.id}`, evento).pipe(take(1));
  }

  public deleteEvento(id: number): Observable<any> {
    return this.http.delete(`${this.baseURL}/${id}`).pipe(take(1));
  }
}
