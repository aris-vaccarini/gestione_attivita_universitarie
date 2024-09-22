using attivitaUniversitarie.Models;
using Microsoft.EntityFrameworkCore;


namespace attivitaUniversitarie.Data
{

    /*
    * Rappresenta il contesto del database per l'applicazione.
    * Fornisce l'accesso ai DbSet per le entità User e Attivita.
    * Definisce la relazione Many-To-One tra le entità User e Attivita.
    */
    public class ApplicationDbContext : DbContext
    {

        public DbSet<User> User { get; set; }
        public DbSet<Attivita> Attivita { get; set; }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .HasMany(u => u.Attivita)
                .WithOne(a => a.User)
                .HasForeignKey(a => a.idUser);
        }

    }
}
