using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace attivitaUniversitarie.Models
{
    public class User
    {
        [Key]
        public string id { get; set; }  = Guid.NewGuid().ToString();
        public string email { get; set; } = string.Empty;
        public string password { get; set; } = string.Empty;

        //Relazione 1:N con Attività
        public ICollection<Attivita> Attivita { get; set; } = new List<Attivita>();
    }
}
