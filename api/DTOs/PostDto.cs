using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;

namespace friendly.DTOs
{
    public class PostDto
    {
        [Key]
        public int PostId { get; set; }
    
        // The file path for the image to the post
        [ValidateNever]
        public string? PostImagePath { get; set; }  

        // Caption of the post
        [Required]
        [StringLength(200)]
        public string? Caption { get; set; }

        // The date the post was created
        [ValidateNever]
        public string? PostDate { get; set; }

        // Foreign key to the user who created the post
        [ValidateNever]
        public string? UserId { get; set; }
    }
}