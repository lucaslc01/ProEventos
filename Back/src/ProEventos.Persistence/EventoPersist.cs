using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ProEventos.Domain;
using ProEventos.Persistence.Contextos;
using ProEventos.Persistence.Contratos;

namespace ProEventos.Persistence
{
    public class EventoPersist : IEventoPersist
    {
        private readonly ProEventosContext _context;

        public EventoPersist(ProEventosContext context)
        {
            _context = context;
            _context.ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;
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

        //retorna todos os eventos
        public async Task<Evento[]> GetAllEventosAsync(bool includePalestrantes = false)
        {
            IQueryable<Evento> query = _context.Eventos.Include(evento => evento.Lotes).Include(evento => evento.RedesSociais);

            if(includePalestrantes){
                query = query.Include(evento => evento.PalestrantesEventos).ThenInclude(palestranteEvento => palestranteEvento.Palestrante);
            }

            query = query.OrderBy(evento => evento.Id);

            return await query.ToArrayAsync();
        }

        public async Task<Evento[]> GetAllEventosByTemaAsync(string tema, bool includePalestrantes)
        {
            IQueryable<Evento> query = _context.Eventos.Include(evento => evento.Lotes).Include(evento => evento.RedesSociais);

            if(includePalestrantes){
                query = query.Include(evento => evento.PalestrantesEventos).ThenInclude(palestranteEvento => palestranteEvento.Palestrante);
            }

            //Dado um evento, para cada evento que existir, procura o tema, converte para lower case e analisa se esse tema contém um tema 
            //passado como parâmetro (tema) e convertido para lower case.
            query = query.OrderBy(evento => evento.Id).Where(evento => evento.Tema.ToLower().Contains(tema.ToLower()));

            return await query.ToArrayAsync();
        }

    }
}