using Microsoft.AspNetCore.Mvc;
using attivitaUniversitarie.Services;

namespace attivitaUniversitarie.Controllers
{
    /*
    * Questa classe gestisce le richieste HTTP relative all'autenticazione degli utenti.
    * Utilizza il servizio AuthService per eseguire le operazioni di login e registrazione.
    *
    */
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }


        /*
        *   - Login:
        *       - Riceve le credenziali dell'utente (email e password) dal corpo della richiesta.
        *       - Valida le credenziali utilizzando il servizio AuthService.
        *       - Genera un token JWT se le credenziali sono valide.
        *       - Restituisce il token nell'header della risposta o nel corpo della risposta.
        */
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var token = _authService.LoginUserAsync(request.Email, request.Password).Result;
            if (token == null)
            {
                return Unauthorized();
            }

            // Risposta con il token
            return Ok(new { token = token });
        }


        /*
        *   - Register:
        *       - Riceve i dati di registrazione dell'utente dal corpo della richiesta.
        *       - Valida i dati di input.
        *       - Crea un nuovo utente nel database utilizzando il servizio AuthService.
        *       - Genera un token JWT per il nuovo utente.
        *       - Restituisce il token nell'header della risposta o nel corpo della risposta.
        */
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            // Registrazione dell'utente
            var user = await _authService.RegisterUserAsync(request.Email, request.Password);        
            return Ok(user); // Restituisci solo il token
        }
    }
}
