import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Evento } from '@app/models/Evento';
import { EventoService } from '@app/services/evento.service';
import { PaginatedResult, Pagination } from '@app/models/Pagination';
import { Subject } from 'rxjs/internal/Subject';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-evento-lista',
  templateUrl: './evento-lista.component.html',
  styleUrls: ['./evento-lista.component.scss']
})
export class EventoListaComponent implements OnInit {

  public modalRef!: BsModalRef;
  public eventos : Evento[] = [];
  public eventoId: number = 0;
  public pagination = {} as Pagination;

  public mostrarImagem: boolean = true;

  termoBuscaChanged: Subject<string> = new Subject<string>();

  //toda vez que digito algo no campo de busca do site, o filtrar é chamado
  public filtrarEventos(evt: any): void{

    //se existe algo dentro do meu termo de busca, o código debaixo todo é pulado
    if(this.termoBuscaChanged.observers.length === 0){
      this.termoBuscaChanged.pipe(debounceTime(1500)).subscribe( // debounceTime(100) indica que o código abaixo só pode ser executado de 1 em 1 segundo mesmo após alguma alteração que causa sua chamada.
        filtrarPor => {
          this.spinner.show();
          this.eventoService.getEventos(
            this.pagination.currentPage,
            this.pagination.itemsPerPage,
            filtrarPor
          ).subscribe(
            (paginatedResult: PaginatedResult<Evento[]>) => {
              this.eventos = paginatedResult.result;
              this.pagination = paginatedResult.pagination;
            },
            (error: any) => {
              this.spinner.hide();
              this.toastr.error('Erro ao Carregar os Eventos', 'Erro!');
            }
          ).add(() => this.spinner.hide());
        }
      )
    }
    this.termoBuscaChanged.next(evt.value);
  }

  constructor(
    private eventoService: EventoService,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private router: Router
    ) { }

  public ngOnInit(): void {

    this.pagination = {currentPage: 1, itemsPerPage: 3, totalItems: 1} as Pagination;
    this.carregarEventos();

  }

  public alterarImagem(): void {
    this.mostrarImagem = !this.mostrarImagem
  }

  public carregarEventos(): void {

    //inicia o spinner (animação para carregamento)
    this.spinner.show();

    //o subscribe só retorna a resposta (response) quando a chamada da api/eventos tiver terminada.
    this.eventoService.getEventos(this.pagination.currentPage, this.pagination.itemsPerPage).subscribe(
      (paginatedResult: PaginatedResult<Evento[]>) => {
        this.eventos = paginatedResult.result;
        this.pagination = paginatedResult.pagination;
      },
      (error: any) => {
        this.spinner.hide();
        this.toastr.error('Erro ao Carregar os Eventos', 'Erro!');
      },
    ).add(() => this.spinner.hide());
  }

  openModal(event: any, template: TemplateRef<any>, eventoId: number): void {
    event.stopPropagation();
    this.eventoId = eventoId;
    this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
  }

  public pageChanged(event): void{
    this.pagination.currentPage = event.page;
    this.carregarEventos();
  }

  confirm(): void {
    this.modalRef?.hide();
    this.spinner.show();

    this.eventoService.deleteEvento(this.eventoId).subscribe({
      next: (result: any) => {
        console.log(result);
        this.toastr.success('O Evento foi deletado com Sucesso.', 'Deletado!');
        this.carregarEventos();
      },
      error: (error: any) => {
        console.error(error);
        this.toastr.error(`Erro ao tentar deletar o evento ${this.eventoId}`, 'Erro');
      },
      complete: () => {},
    }).add(() => this.spinner.hide()); // o add adiciona a cahamda do spinner nos três campos (next, error e complete).

    this.toastr.success('O Evento foi deletado com Sucesso.', 'Deletado!');
  }

  decline(): void {
    this.modalRef?.hide();
  }

  detalheEvento(id: number): void{
    this.router.navigate([`eventos/detalhe/${id}`]);
  }

}
