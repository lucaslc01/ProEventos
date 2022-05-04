using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ProEventos.Domain;

namespace ProEventos.Persistence.Contextos
{
    public class ProEventosContext : DbContext
    {
        public ProEventosContext(DbContextOptions<ProEventosContext> options) 
        : base(options){ }
        public DbSet<Evento> Eventos { get; set; }
        public DbSet<Lote> Lotes { get; set; }
        public DbSet<Palestrante> Palestrantes { get; set; }
        public DbSet<PalestranteEvento> PalestrantesEventos { get; set; }
        public DbSet<RedeSocial> RedeSociais { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder){
            modelBuilder.Entity<PalestranteEvento>().HasKey(PE => new {PE.EventoId, PE.PalestranteId});

            //para cada entidade evento que contenha redes sociais, deletar também suas redes sociais, caso a entidade evento seja deletada (cascade).
            modelBuilder.Entity<Evento>()
                .HasMany(evento => evento.RedesSociais)
                .WithOne(redessociais => redessociais.Evento)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Palestrante>()
                .HasMany(evento => evento.RedesSociais)
                .WithOne(redessociais => redessociais.Palestrante)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}