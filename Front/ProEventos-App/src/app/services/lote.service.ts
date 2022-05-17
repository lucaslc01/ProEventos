import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { take } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { Lote } from '@app/models/Lote';

@Injectable()
export class LoteService {

  baseURL = 'https://localhost:5001/api/lotes';

  constructor(private http: HttpClient) { }

  //para poder usar o subscribe em uma função, é necessário declarar a função a ser consultada abaixo como do tipo Observable para que seja
  //possível se inscrever nela (acompanhar a função durante a execução).
  public getLotesByEventoId(eventoId: number): Observable<Lote[]> {
    return this.http.get<Lote[]>(`${this.baseURL}/${eventoId}`)
            .pipe(take(1));//o take realiza a chamada do observable 1 vez e desinscreve automaticamente do observable.
  }

  public saveLote(eventoId: number, lotes: Lote[]): Observable<Lote[]> {
    return this.http.put<Lote[]>(`${this.baseURL}/${eventoId}`, lotes).pipe(take(1));
  }

  public deleteLote(eventoId: number, loteId: number): Observable<any> {
    return this.http.delete(`${this.baseURL}/${eventoId}/${loteId}`).pipe(take(1));
  }

}
