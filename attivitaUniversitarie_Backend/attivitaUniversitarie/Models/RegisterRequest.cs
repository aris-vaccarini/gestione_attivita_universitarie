using System.ComponentModel.DataAnnotations;

public class RegisterRequest
    {
        [Required]
        [EmailAddress]
        public required string Email { get; set; }

        [Required]
        [MinLength(6)]  
        public required string Password { get; set; }
    }