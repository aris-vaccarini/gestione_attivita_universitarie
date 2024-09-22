using attivitaUniversitarie.Data;
using attivitaUniversitarie.Models;
using Microsoft.EntityFrameworkCore;


/*
 *
 * Gestice le operazioni CRUD (Create, Read, Update, Delete) sulle attività degli utenti.
 * Fornisce un'interfaccia per interagire con il database per aggiungere, recuperare, modificare ed eliminare attività.
 * Si appoggia su ApplicationDbContext per accedere ai dati e su IUserService per recuperare l'ID utente loggato (necessario per la sicurezza).
 */
public class AttivitaService
{
    private readonly ApplicationDbContext _context;
    private readonly IUserService _userService;

    public AttivitaService(ApplicationDbContext context,  IUserService userService)
    {
        _context = context;
        _userService = userService;
    }

    /// <summary>
    /// Aggiunge una nuova attività al database.
    /// </summary>
    /// <param name="attivita"> L'oggetto Attivita contenente i dettagli della nuova attività.</param>
    /// <returns> L'oggetto Attivita appena aggiunto, incluso l'ID assegnato.</returns>
    public async Task<Attivita> AddAttivitaAsync(Attivita attivita)
    {
        _context.Attivita.Add(attivita);
        await _context.SaveChangesAsync();
        return attivita;
    }

    /// <summary>
    /// Recupera tutte le attività associate a un utente specifico.
    /// </summary>
    /// <param name="userId"> L'ID dell'utente per cui recuperare le attività.</param>
    /// <returns> Una collezione di oggetti Attivita che rappresentano le attività dell'utente.</returns>
    public async Task<IEnumerable<Attivita>> GetAttivitaByUserIdAsync(string userId)
    {
        return await _context.Attivita.Where(a => a.idUser == userId).ToListAsync();
    }

    /// <summary>
    /// Recupera un'attività specifica in base al suo ID, assicurandosi che appartenga all'utente loggato.
    /// </summary>
    /// <param name="id"> L'ID dell'attività da recuperare.</param>
    /// <returns> Una lista contenente un singolo oggetto Attivita (se trovato) o null se l'attività non esiste o non appartiene all'utente.</returns>
    public async Task<List<Attivita?>> GetAttivitaByIdAsync(int id)
    {
        var userId = _userService.GetUserId();
        return await _context.Attivita
                             .Where(a => a.idUser == userId)
                             .ToListAsync();
    }

    /// <summary>
    /// Aggiorna un'attività esistente nel database.
    /// </summary>
    /// <param name="attivita"> L'oggetto Attivita aggiornato con i nuovi dati.</param>
    /// <returns> L'oggetto Attivita aggiornato, oppure null se l'attività non esiste.</returns>
    public async Task<Attivita?> UpdateAttivitaAsync(Attivita attivita)
    {
        _context.Entry(attivita).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return attivita;
    }

    /// <summary>
    /// Elimina un'attività dal database.
    /// </summary>
    /// <param name="id"> L'ID dell'attività da eliminare.</param>
    /// <param name="userId"> L'ID utente dell'attività da eliminare (per sicurezza).</param>
    /// <returns> True se l'eliminazione è avvenuta con successo, False altrimenti.</returns>
    public async Task<bool> DeleteAttivitaAsync(int id, string userId)
    {
        var attivita = await _context.Attivita.FirstOrDefaultAsync(a => a.Id == id && a.idUser == userId);
        if (attivita == null)
        {
            return false;
        }

        _context.Attivita.Remove(attivita);
        await _context.SaveChangesAsync();
        return true;
    }
}
