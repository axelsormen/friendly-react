using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;

namespace friendly.DTOs
{
   public class CommentDto
   {
       public int CommentId { get; set; }

       // The actual text of the comment
       [Required(ErrorMessage = "Comment text is required.")]
       [MinLength(1, ErrorMessage = "Comment must be at least 1 character long.")]
       [MaxLength(200, ErrorMessage = "Comment cannot exceed 200 characters.")]
       public string? CommentText { get; set; }

       // The date when the comment was posted
       public string? CommentDate { get; set; }

       // The UserId representing the user who posted the comment
       public string? UserId { get; set; }

       // Foreign key representing the post that this comment belongs to
       public int PostId { get; set; }
   }
}
