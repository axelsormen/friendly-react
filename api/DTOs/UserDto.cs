using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;

namespace friendly.DTOs
{
   public class UserDto
   {
       // Unique identifier for the user
       public string? Id { get; set; }

       // Username of the user
       public string? UserName { get; set; }

       // First name of the user
       public string? FirstName { get; set; }

       // Last name of the user
       public string? LastName { get; set; }

       // URL to the user's profile image
       public string? ProfileImageUrl { get; set; }

       // Email of the user
       public string? Email { get; set; }

       // Phone Number of the user
       public string? PhoneNumber { get; set; }

       // Has user confirmed their email
       public bool? EmailConfirmed { get; set; }
   }
}
