using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;


namespace attivitaUniversitarie.Models
{
    public class Attivita
    {
        [Key]
        public int Id { get; set; }
        public string titolo { get; set; } = string.Empty;
        public string descrizione { get; set; } = string.Empty;
        public DateTime scadenza { get; set; }
        public string stato  {get; set; }
        public string idUser  { get; set; }
        
        [JsonIgnore]
        [ForeignKey("idUser")]
        public User? User { get; set; }

    }
}
