import { identifierName } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Evento } from '@app/models/Evento';
import { EventoService } from '@app/services/evento.service';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-evento-detalhe',
  templateUrl: './evento-detalhe.component.html',
  styleUrls: ['./evento-detalhe.component.scss']
})
export class EventoDetalheComponent implements OnInit {

  evento: Evento;
  form!: FormGroup;
  estadoSalvar = 'post';

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
              private router: ActivatedRoute,
              private eventoService: EventoService,
              private spinner: NgxSpinnerService,
              private toastr: ToastrService)
  {
    this.localeService.use('pt-br');
  }

  public carregarEvento(): void {

    //eventoIdParam é uma string
    const eventoIdParam = this.router.snapshot.paramMap.get('id');

    if (eventoIdParam !== null) {
      this.spinner.show();

      this.estadoSalvar = 'put';

      //caso eventoIdParam não seja null, getEventoById recebe eventoIdParam convertido para number com o '+' do lado.
      this.eventoService.getEventoById(+eventoIdParam).subscribe({
        next: (evento: Evento) => {

          //cada uma das propriedades do evento do getEventoById são atribuídas para this.evento.
          //Os '...' servem para que uma cópia seja feita do evento e essa cópia seja tribuída a this.evento.
          //Sem os '...' o objeto evento vindo de getEventoById atribuído seria associado a this.eventos na posição de memória.
          this.evento = {...evento};
          this.form.patchValue(this.evento);
        },
        error: (error:any) => {
          this.spinner.hide();
          this.toastr.error('Erro ao tentar carregar Evento.', 'Erro!');
          console.error(error);
        },
        complete: () => {this.spinner.hide();},
      });
    }
  }

  ngOnInit(): void {
    this.validation();
    this.carregarEvento();
  }

  //preenche as variáveis de models/Evento.ts
  public validation(): void{
    this.form = this.fb.group({
      tema: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
      local: ['', Validators.required],
      dataEvento: ['', Validators.required],
      qtdPessoas: ['', [Validators.required, Validators.max(120000)]],
      telefone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      imagemURL: ['', Validators.required],
    });
  }

  public resetForm(): void {
    this.form.reset();
  }

  public cssValidator(campoForm: FormControl): any{
    return {'is-invalid': campoForm.errors && campoForm.touched};
  }

  public salvarAlteracao(): void {
    this.spinner.show();
    if(this.form.valid){

      //verifica se é um post(novo evento) ou put(atualizacao de algum campo do evento)
      this.evento = (this.estadoSalvar === 'post')
                  ? {...this.form.value}
                  : {id: this.evento.id, ...this.form.value};

      //faz o post ou put (valor armazenado em this.estadoSalvar) e chama o observable em evento.service.ts
      //correspondente.
      this.eventoService[this.estadoSalvar](this.evento).subscribe({
        next: () => {this.toastr.success('Evento salvo com Sucesso!', 'Sucesso!');},
        error: (error: any) => {
          console.error(error);
          this.spinner.hide();
          this.toastr.error('Error ao salvar evento', 'Erro')
        },
        complete: () => {this.spinner.hide();}
      });

    }
  }
}
