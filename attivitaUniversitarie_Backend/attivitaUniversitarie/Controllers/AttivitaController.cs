using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using attivitaUniversitarie.Data;
using attivitaUniversitarie.Models;

namespace attivitaUniversitarie.Controllers
{

    /*
    * Questo controller gestisce le richieste HTTP relative alle attività dell'utente loggato.
    * Richiede l'autorizzazione tramite token JWT per accedere ai metodi.
    */
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AttivitaController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AttivitaController(ApplicationDbContext context)
        {
            _context = context;
        }

        /*
        * Recupera le attività associate all'utente loggato.
        *
        * Preleva l'ID utente dal token JWT e filtra le attività nel database in base all'idUser corrispondente.
        * Restituisce una lista di oggetti AttivitaDTO contenenti le informazioni essenziali.
        */
        [HttpGet("byUser")]
        public IActionResult GetAttivitaByUser()
        {
            var userId = User.FindFirst("idUser")?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User ID not found in token");
            }

            var attivitaList = _context.Attivita
                .Where(a => a.idUser == userId)
                .Select(a => new AttivitaDTO {
                    Id = a.Id,
                    Titolo = a.titolo,
                    Descrizione = a.descrizione,
                    Scadenza = a.scadenza.ToString("o"),
                    Stato = a.stato,
                    IdUser = a.idUser
                }).ToList();

            return Ok(attivitaList);
        }

    

        /*
        * Crea una nuova attività.
        *
        * Riceve un oggetto Attivita dal corpo della richiesta e lo convalida.
        * Controlla l'esistenza dell'utente tramite idUser prima di salvare l'attività 
        * nel database.
        * Restituisce lo status code 201 Created con l'attività appena creata 
        * in caso di successo.
        */        
        [HttpPost]
        public async Task<IActionResult> CreateAttivita([FromBody] Attivita attivita)
        {
             Console.WriteLine($"Ricevuto: {attivita.scadenza}");
            if (attivita == null)
            {
                return BadRequest("Attività object is null");
            }

            if (string.IsNullOrEmpty(attivita.idUser))
            {
                return BadRequest("User ID is required");
            }

            try
            {
                var userExists = await _context.User.AnyAsync(u => u.id == attivita.idUser);
                if (!userExists)
                {
                    return BadRequest("User ID is invalid");
                }

                _context.Attivita.Add(attivita);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetAttivitaByUser), new { id = attivita.Id }, attivita);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error creating new activity: {ex.Message}");
            }
        }


        /*
        * Aggiorna un'attività esistente.
        *
        * Riceve l'ID dell'attività e l'oggetto Attivita aggiornato dal corpo della richiesta.
        * Controlla la corrispondenza dell'ID e recupera l'attività esistente dal database.
        * Aggiorna i campi dell'attività e salva le modifiche.
        * Restituisce lo status code 204 No Content in caso di successo.
        *
        */
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAttivita(int id, [FromBody] Attivita attivita)
        {
            if (id != attivita.Id)
            {
                return BadRequest("Activity ID mismatch");
            }

            Console.WriteLine($"Modifica attività ID: {id}, Scadenza: {attivita.scadenza}");

            try
            {
                var existingAttivita = await _context.Attivita.FindAsync(id);
                if (existingAttivita == null)
                {
                    return NotFound();
                }
                existingAttivita.titolo = attivita.titolo;
                existingAttivita.descrizione = attivita.descrizione;
                existingAttivita.scadenza = attivita.scadenza;
                existingAttivita.stato = attivita.stato;
                existingAttivita.idUser = attivita.idUser;

                _context.Entry(existingAttivita).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AttivitaExists(id))
                {
                    return NotFound();
                }
                else
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, "Errore durante l'aggiornamento dell'attività");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Errore durante l'aggiornamento: {ex.Message}");
            }
        }

        /*
        * Elimina un'attività esistente.
        *
        * Riceve l'ID dell'attività dall'URL e la cerca nel database.
        * Se l'attività esiste, la elimina dal database e salva le modifiche.
        * Restituisce lo status code 204 No Content in caso di successo oppure lo status code 404 Not Found se l'attività non viene trovata.
        */
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAttivita(int id)
        {
            try
            {
                var attivita = await _context.Attivita.FindAsync(id);
                if (attivita == null)
                {
                    return NotFound();
                }

                _context.Attivita.Remove(attivita);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error deleting activity: {ex.Message}");
            }
        }


        /*
        * Metodo helper per verificare l'esistenza di un'attività 
        * in base al suo ID.
        */
        private bool AttivitaExists(int id)
        {
            return _context.Attivita.Any(e => e.Id == id);
        }
    }
}
