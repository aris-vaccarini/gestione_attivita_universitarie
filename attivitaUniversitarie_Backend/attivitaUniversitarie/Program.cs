using Microsoft.EntityFrameworkCore;
using attivitaUniversitarie.Data;
using attivitaUniversitarie.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Configura CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        policyBuilder => policyBuilder
            .AllowAnyOrigin() // Consente tutte le origini
            .AllowAnyMethod() // Consente tutti i metodi (GET, POST, etc.)
            .AllowAnyHeader()); // Consente tutti gli header
});

// Configura Entity Framework e la connessione al database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(builder.Configuration.GetConnectionString("DefaultConnection"), 
        new MySqlServerVersion(new Version(8, 0, 21))));

// Configura l'autenticazione JWT
var key = Encoding.ASCII.GetBytes(builder.Configuration["Jwt:Secret"]);
builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidateLifetime = true 
    };
});

// Aggiunge il servizio di autorizzazione
builder.Services.AddAuthorization();

// Aggiunge i servizi necessari per i controller e le API
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Configura le opzioni di serializzazione JSON
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.WriteIndented = true;
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.Preserve;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.Converters.Add(new DateTimeConverter());
    });

// Aggiunge il servizio di Swagger per la documentazione delle API
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Aggiunge il servizio di autenticazione
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<AttivitaService>();

// Ottiene il contesto dell'utente loggato attraverso IHttpContextAccessor
builder.Services.AddHttpContextAccessor();

// Aggiunge il servizio personalizzato per recuperare l'ID utente dal contesto JWT
builder.Services.AddScoped<IUserService, UserService>();

var app = builder.Build();

// Configura il middleware CORS
app.UseCors("AllowAllOrigins");

// Configura il pipeline delle richieste HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

// Mappa i controller
app.MapControllers(); 

// Aggiunge l'URL per l'app
app.Urls.Add("https://localhost:7163");

app.Run();
