using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;

namespace friendly.DTOs
{
   public class LikeDto
   {
      public int LikeId { get; set; }

       // Foreign key representing the post that this like belongs to
      [Required(ErrorMessage = "Post ID is required.")]
      public int PostId { get; set; }

       // The UserId representing the user who liked the post
      [Required(ErrorMessage = "User ID is required.")]
      [MaxLength(450)]
      public string? UserId { get; set; }
  }
}
