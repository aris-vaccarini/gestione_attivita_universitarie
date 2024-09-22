using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using attivitaUniversitarie.Models;
using attivitaUniversitarie.Data;
using Microsoft.EntityFrameworkCore;

namespace attivitaUniversitarie.Services
{
    /// <summary>
    /// Classe che gestisce le operazioni di autenticazione degli utenti, come la registrazione e il login.
    /// Utilizza JWT (JSON Web Tokens) per autenticare gli utenti e interagisce con il database per salvare le informazioni degli utenti.
    /// </summary>
    public class AuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }


        /// <summary>
        /// Registra un nuovo utente
        /// </summary>
        /// <param name="email">L'email dell'utente.</param>
        /// <param name="password">La password dell'utente.</param>
        /// <returns>Il nuovo oggetto User o null se la registrazione è fallita.</returns>
        public async Task<User> RegisterUserAsync(string email, string password)
        {
            var user = new User
            {
                email = email,
                password = BCrypt.Net.BCrypt.HashPassword(password) 
            };

            _context.User.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }


        /// <summary>
        /// Autentica un utente esistente e genera un token JWT.
        /// </summary>
        /// <param name="email">L'indirizzo email dell'utente.</param>
        /// <param name="password">La password dell'utente.</param>
        /// <returns>Un token JWT che rappresenta l'utente autenticato, o null se l'autenticazione fallisce.</returns>
        public async Task<string?> LoginUserAsync(string email, string password)
        {
            var user = await _context.User.FirstOrDefaultAsync(u => u.email == email); 
            if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.password))
            {
                return null;
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Secret"] ?? string.Empty); 
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim("idUser", user.id)
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                Issuer = _configuration["Jwt:Issuer"], 
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
