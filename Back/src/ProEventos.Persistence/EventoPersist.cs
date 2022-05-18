using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ProEventos.Domain;
using ProEventos.Persistence.Contextos;
using ProEventos.Persistence.Contratos;
using ProEventos.Persistence.Models;

namespace ProEventos.Persistence
{
    public class EventoPersist : IEventoPersist
    {
        private readonly ProEventosContext _context;

        public EventoPersist(ProEventosContext context)
        {
            _context = context;

            //não rastrear o registro na entidade (banco de dados). Assim será possível alterar uma variável da dados com patch
            _context.ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;
        }

        //retorna todos os eventos
        public async Task<PageList<Evento>> GetAllEventosAsync(PageParams pageParams, bool includePalestrantes = false)
        {
            IQueryable<Evento> query = _context.Eventos.Include(evento => evento.Lotes).Include(evento => evento.RedesSociais);

            if(includePalestrantes){
                query = query.Include(evento => evento.PalestrantesEventos).ThenInclude(palestranteEvento => palestranteEvento.Palestrante);
            }

            //Dado um evento, para cada evento que existir, procura o tema, converte para lower case e analisa se esse tema contém um tema 
            //passado como parâmetro (tema) e convertido para lower case.
            query = query.AsNoTracking().Where(e => (e.Tema.ToLower().Contains(pageParams.Term.ToLower())) 
                                                        || (e.Local.ToLower().Contains(pageParams.Term.ToLower())) ).OrderBy(evento => evento.Id);

            return await PageList<Evento>.CreateAsync(query, pageParams.PageNumber, pageParams.pageSize);
        }

                public async Task<Evento> GetEventoByIdAsync(int eventoId, bool includePalestrantes = false)
        {
            IQueryable<Evento> query = _context.Eventos.Include(evento => evento.Lotes).Include(evento => evento.RedesSociais);

            //se a pessoa quer incluir o palestrante 
            if(includePalestrantes){
                //a cada evento, incluir o palestranteEvento e, dentro do palestranteEvento, incluir o palestrante.
                query = query.Include(evento => evento.PalestrantesEventos).ThenInclude(palestranteEvento => palestranteEvento.Palestrante);
            }

            query = query.OrderBy(evento => evento.Id).Where(evento => evento.Id == eventoId);

            return await query.FirstOrDefaultAsync();
        }

    }
}