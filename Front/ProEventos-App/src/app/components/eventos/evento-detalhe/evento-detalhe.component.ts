import { Component, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Evento } from '@app/models/Evento';
import { Lote } from '@app/models/Lote';
import { EventoService } from '@app/services/evento.service';
import { LoteService } from '@app/services/lote.service';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-evento-detalhe',
  templateUrl: './evento-detalhe.component.html',
  styleUrls: ['./evento-detalhe.component.scss']
})
export class EventoDetalheComponent implements OnInit {

  modalRef: BsModalRef
  eventoId: number;
  evento: Evento;
  form!: FormGroup;
  estadoSalvar = 'post';
  loteAtual = {id: 0, nome: '', indice: 0};

  get modoEditar (): boolean {
    return this.estadoSalvar === 'put';
  }

  get lotes(): FormArray {
    return this.form.get('lotes') as FormArray;
  }

  get f(): any {
    return this.form.controls;
  }

  get bsConfig(): any {
    return {
      adaptativePosition: true,
      dateInputFormat: 'DD/MM/YYYY hh:mm a',
      containerClass: 'theme-default',
      showWeekNumbers: false
    }
  }

  constructor(private fb: FormBuilder,
              private localeService: BsLocaleService,
              private activatedRouter: ActivatedRoute,
              private eventoService: EventoService,
              private spinner: NgxSpinnerService,
              private toastr: ToastrService,
              private router: Router,
              private loteService: LoteService,
              private modalService: BsModalService)
  {
    this.localeService.use('pt-br');
  }

  public carregarEvento(): void {

    this.eventoId = +this.activatedRouter.snapshot.paramMap.get('id');

    if (this.eventoId !== null && this.eventoId !== 0) {
      this.spinner.show();

      this.estadoSalvar = 'put';

      //caso eventoIdParam n??o seja null, getEventoById recebe eventoIdParam convertido para number com o '+' do lado.
      this.eventoService.getEventoById(this.eventoId).subscribe({
        next: (evento: Evento) => {

          //cada uma das propriedades do evento do getEventoById s??o atribu??das para this.evento.
          //Os '...' servem para que uma c??pia seja feita do evento e essa c??pia seja tribu??da a this.evento.
          //Sem os '...' o objeto evento vindo de getEventoById atribu??do seria associado a this.eventos na posi????o de mem??ria.
          this.evento = {...evento};
          this.form.patchValue(this.evento);
          this.evento.lotes;
          //this.carregarLotes();
        },
        error: (error:any) => {
          this.toastr.error('Erro ao tentar carregar Evento.', 'Erro!');
          console.error(error);
        },
        complete: () => {}
      }).add(() => this.spinner.hide());
    }
  }

  public carregarLotes(): void {
    this.loteService.getLotesByEventoId(this.eventoId).subscribe(
      (lotesRetorno: Lote[]) => {
        lotesRetorno.forEach(lote => {
          this.lotes.push(this.criarLote(lote));
        });
      },
      (error: any) => {
        this.toastr.error('Erro ao tentar carregar lotes', 'Erro');
        console.error(error);
      }
    ).add(() => this.spinner.hide());
  }

  ngOnInit(): void {
    this.validation();
    this.carregarEvento();
  }

  //preenche as vari??veis de models/Evento.ts
  public validation(): void{
    this.form = this.fb.group({
      tema: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
      local: ['', Validators.required],
      dataEvento: ['', Validators.required],
      qtdPessoas: ['', [Validators.required, Validators.max(120000)]],
      telefone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      imagemURL: ['', Validators.required],
      lotes: this.fb.array([])
    });
  }

  adicionarLote(): void {

    this.lotes.push(this.criarLote({id: 0} as Lote));

  }

  criarLote(lote: Lote): FormGroup {
    return this.fb.group({
      id: [lote.id],
      nome: [lote.nome, Validators.required],
      quantidade: [lote.quantidade, Validators.required],
      preco: [lote.preco, Validators.required],
      dataInicio: [lote.dataInicio],
      dataFim: [lote.dataFim]
    })
  }

  public mudarValorData(value: Date, indice: number, campo: string): void {
    this.lotes.value[indice][campo] = value;
  }

  public retornaTituloLote(nome: string): string {
    return nome === null ||nome === '' ? 'Nome do lote' : nome;
  }

  public resetForm(): void {
    this.form.reset();
  }

  public cssValidator(campoForm: FormControl | AbstractControl): any{
    return {'is-invalid': campoForm.errors && campoForm.touched};
  }

  public salvarEvento(): void {
    this.spinner.show();
    if(this.form.valid){

      //verifica se ?? um post(novo evento) ou put(atualizacao de algum campo do evento)
      this.evento = (this.estadoSalvar === 'post')
                  ? {...this.form.value}
                  : {id: this.evento.id, ...this.form.value};

      //faz o post ou put (valor armazenado em this.estadoSalvar) e chama o observable em evento.service.ts
      //correspondente.
      this.eventoService[this.estadoSalvar](this.evento).subscribe({
        next: (eventoRetorno: Evento) => {
          this.toastr.success('Evento salvo com Sucesso!', 'Sucesso!');
          this.router.navigate([`eventos/detalhe/${eventoRetorno.id}`]);
        },
        error: (error: any) => {
          console.error(error);
          this.spinner.hide();
          this.toastr.error('Error ao salvar evento', 'Erro')
        },
        complete: () => {this.spinner.hide();}
      });
    }
  }

  public salvarLotes(): void {
    this.spinner.show();
    if(this.form.controls.lotes.valid){
      this.loteService.saveLote(this.eventoId, this.form.value.lotes).subscribe({
        next: () => {
          this.toastr.success('Lotes salvos com Sucesso!', 'Successo!');
        },
        error: (error: any) => {
          this.toastr.error('Erro ao tentar salvar lotes.', 'Erro');
          console.error(error);
        },
        complete: () => {}
      }).add(() => this.spinner.hide());
    }
  }

  public removerLote(template: TemplateRef<any>, indice: number): void {

    this.loteAtual.id = this.lotes.get(indice + '.id').value;
    this.loteAtual.nome = this.lotes.get(indice + '.nome').value;
    this.loteAtual.indice = indice;

    this.modalRef = this.modalService.show(template, {class:'modal-sm'});
  }

  confirmDeleteLote(): void {
    this.modalRef.hide();
    this.spinner.show();

    this.loteService.deleteLote(this.eventoId, this.loteAtual.id).subscribe(
      () => {
        this.toastr.success('Lote deletado com sucesso', 'Sucesso');
        this.lotes.removeAt(this.loteAtual.indice);
      },
      (error: any) => {
        this.toastr.error(`erro ao tentar deletar o Lote ${this.loteAtual.id}`, 'Erro');
        console.error(error)
      }
    ).add(() => this.spinner.hide());
  }

  declineDeleteLote(): void {
    this.modalRef.hide();
  }

}
