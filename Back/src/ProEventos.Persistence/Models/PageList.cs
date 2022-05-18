using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace ProEventos.Persistence.Models
{
    public class PageList<T> : List<T> //pagelist herda de List do tipo T
    {
        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }
        public int PageSize { get; set; } //itens por página que tenho.
        public int TotalCount { get; set; }

        public PageList() { }

        //lista de itens "items" que quero paginar
        public PageList(List<T> items, int count, int pageNumber, int pageSize)
        {
            TotalCount = count;
            PageSize = pageSize;
            CurrentPage = pageNumber; //pageNumber é a página atual de consulta
            TotalPages = (int)Math.Ceiling(count / (double)pageSize); //cálculo do total de páginas
            AddRange(items); //herança do List. Passo diverços items para minha lista de paginação
        }

        public static async Task<PageList<T>> CreateAsync ( IQueryable<T> source, int pageNumber, int pageSize ){
            
            var count = await source.CountAsync(); //conta quantos itens um evento tem dentro.
            var items = await source.Skip((pageNumber-1) * pageSize) //pula a página naterior de acordo com o número de itens. Ex: página um tem 3 itens, então para chegar na página 3, pula-se a pagina 1 e 2 com um total de 2*3=6 itens.
                                    .Take(pageSize) //Pega os próximos 3 itens (da página 3, seguindo o exemplo dado no comentário acima).
                                    .ToListAsync(); //Retorna os 3 itens, seguindo o exemplo do comentário acima.
            return new PageList<T>(items, count, pageNumber, pageSize);
        }
    }
}