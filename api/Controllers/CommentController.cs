using Microsoft.AspNetCore.Mvc;
using friendly.DAL;
using friendly.Models;
using friendly.ViewModels;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using friendly.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace friendly.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentAPIController : Controller
    {
        private readonly ICommentRepository _commentRepository;  // Repository to interact with comments
        private readonly ILogger<CommentAPIController> _logger; // Logger for logging information and errors

        public CommentAPIController(ICommentRepository commentRepository, ILogger<CommentAPIController> logger)
        {
            _commentRepository = commentRepository;
            _logger = logger;
        }

        [HttpGet("commentlist")]
        public async Task<IActionResult> CommentList()
        {
            try
            {
                // Fetch comments for the given post ID
                var comments = await _commentRepository.GetAll();
                if (comments == null) // Check if no comments are found
                {
                    _logger.LogError("[CommentAPIController] Comment list not found while executing _commentRepository.GetAll()");
                    return NotFound("Comment list not found");
                }

                // Map comments to CommentDto
                var commentDtos = comments.Select(comment => new CommentDto
                {
                    CommentId = comment.CommentId,
                    CommentText = comment.CommentText,
                    CommentDate = comment.CommentDate,
                    UserId = comment.UserId,
                    PostId = comment.PostId
                });

                return Ok(commentDtos); // Return the list of comment DTOs
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "[CommentAPIController] Error occurred while fetching comments.");
                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpGet("comment/{id}")]
        public async Task<IActionResult> GetCommentById(int id)
        {
            try
            {
                // Retrieve the comment by ID
                var comment = await _commentRepository.GetCommentById(id);
                
                if (comment == null)
                {
                    _logger.LogError("[CommentAPIController] Comment not found for CommentId {CommentId}", id);
                    return NotFound("Comment not found");
                }

                // Convert to CommentDto for the response
                var commentDto = new CommentDto
                {
                    CommentId = comment.CommentId,
                    CommentText = comment.CommentText,
                    CommentDate = comment.CommentDate,
                    UserId = comment.UserId,
                    PostId = comment.PostId,
                };

                return Ok(commentDto); // Return the comment details as a response
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[CommentAPIController] Error occurred while fetching comment with CommentId {CommentId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateComment([FromBody] CommentDto commentDto)
        {
            try
            {
                // Validate the model
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Create a new Comment from the DTO
                var comment = new Comment
                {
                    CommentText = commentDto.CommentText,
                    CommentDate = DateTime.Now.ToString(),
                    UserId = commentDto.UserId,
                    PostId = commentDto.PostId
                };

                // Attempt to create the comment in the repository (returns a bool)
                bool isCreated = await _commentRepository.Create(comment);

                // If the comment was not created successfully, return an error response
                if (!isCreated)
                {
                    _logger.LogError("[CommentAPIController] Comment creation failed.");
                    return StatusCode(500, "Comment creation failed.");
                }
                var createdComment = await _commentRepository.GetCommentById(comment.CommentId);

                if (createdComment == null)
                {
                    _logger.LogError("[CommentAPIController] Created comment not found after creation attempt.");
                    return StatusCode(500, "Created comment not found.");
                }

                // Map the created comment back to a DTO
                var createdCommentDto = new CommentDto
                {
                    CommentId = createdComment.CommentId,
                    CommentText = createdComment.CommentText,
                    CommentDate = createdComment.CommentDate,
                    UserId = createdComment.UserId,
                    PostId = createdComment.PostId
                };

                return CreatedAtAction(nameof(CommentList), new { id = createdComment.CommentId }, createdCommentDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[CommentAPIController] Error occurred while creating comment.");
                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateComment(int id, [FromBody] CommentDto commentDto)
        {
            try
            {
                // Retrieve the comment to be updated
                var comment = await _commentRepository.GetCommentById(id);
                if (comment == null)
                {
                    _logger.LogError("[CommentAPIController] Comment not found for CommentId {CommentId}", id);
                    return NotFound("Comment not found");
                }

                // Update only the caption
                comment.CommentText = commentDto.CommentText;

                // Save the updated comment to the database
                bool isUpdated = await _commentRepository.Update(comment);
                if (!isUpdated)
                {
                    _logger.LogError("[CommentAPIController] Comment update failed for CommentId {CommentId}", id);
                    return StatusCode(500, "Comment update failed");
                }

                // Return the updated comment
                var updatedCommentDto = new CommentDto
                {
                    CommentId = comment.CommentId,
                    CommentText = comment.CommentText,
                    CommentDate = comment.CommentDate,
                    UserId = comment.UserId,
                    PostId = comment.PostId,
                };

                return Ok(updatedCommentDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[CommentAPIController] Error occurred while updating comment with CommentId {CommentId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteComment(int id)
        {
            try
            {
                // Retrieve the comment to be deleted
                var comment = await _commentRepository.GetCommentById(id);
                if (comment == null)
                {
                    _logger.LogError("[CommentAPIController] Comment not found for CommentId {CommentId}", id);
                    return NotFound("Comment not found");
                }

                // Attempt to delete the comment
                bool returnOk = await _commentRepository.Delete(id);
                if (!returnOk)
                {
                    _logger.LogError("[CommentAPIController] Comment deletion failed for CommentId {CommentId}", id);
                    return StatusCode(500, "Comment deletion failed");
                }

                _logger.LogInformation("Successfully deleted CommentId: {CommentId}", id);
                return NoContent();  // Successful deletion, no content to return
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[CommentAPIController] Error occurred while deleting comment.");
                return StatusCode(500, "Internal server error.");
            }
        }
    }

    public class CommentController : Controller
    {
        private readonly ICommentRepository _commentRepository; // Repository for interacting with comments
        private readonly ILogger<CommentController> _logger; // Logger for logging errors and info
        private readonly UserManager<User> _userManager;  // UserManager to access user data and manage users

        public CommentController(ICommentRepository commentRepository, ILogger<CommentController> logger, UserManager<User> userManager)
        {
            _commentRepository = commentRepository;
            _logger = logger; // Initialize logger
            _userManager = userManager;  // Initialize UserManager to get user details
        }
        
        [HttpGet]
        [Authorize]  // Only authorized users can create a comment
        public IActionResult Create()
        {
            _logger.LogInformation("Create GET action called.");
            return View();
        }

        [HttpPost]
        [Authorize]  // Only authorized users can post comments
        public async Task<IActionResult> Create(Comment comment)
        {
            _logger.LogInformation("Create POST action called with Comment data: {@Comment}", comment);

            // Get the currently logged-in user
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                _logger.LogError("User not found while creating comment.");
                return Unauthorized();
            }

            // Assign the user's ID to the comment and set the current date as the comment's date
            comment.UserId = user.Id;
            comment.CommentDate = DateTime.Now.ToString();

            // Check if the model state is valid before proceeding
            if (ModelState.IsValid)
            {
                try
                {
                    // Create the comment in the database via the repository
                    await _commentRepository.Create(comment);
                    _logger.LogInformation("Comment created successfully with ID: {CommentId}", comment.CommentId);
                    
                    // Redirect back to the previous page after successful creation
                    return Redirect(Request.Headers["Referer"].ToString());
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred while creating the comment.");
                    ModelState.AddModelError("", "An error occurred while saving your comment.");
                }
            }
            return Redirect(Request.Headers["Referer"].ToString()); // If ModelState is invalid, redirect back
        }

        [HttpGet]
        [Authorize] // Only authorized users can update a comment
        public async Task<IActionResult> Update(int id)
        {
            try
            {
                // Retrieve the comment by its ID from the repository
                var comment = await _commentRepository.GetCommentById(id);
                if (comment == null)
                {
                    _logger.LogError("[CommentController] Comment not found when updating the CommentId {CommentId:0000}", id);
                    return NotFound("Comment not found for the CommentId");
                }

                // Get the current logged-in user using UserManager
                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                {
                    return Unauthorized("User is not logged in.");
                }

                // Check if the logged-in user is the owner of the comment
                if (comment.UserId != user.Id)
                {
                    // If the user is not the owner, deny access to edit the comment
                    return Forbid();
                }

                // Return the comment data to the view for editing
                return View(comment); 
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[CommentController] Error occurred while retrieving the comment for update.");
                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpPost]
        [Authorize] // Only authorized users can update a comment
        public async Task<IActionResult> Update(Comment comment)
        {
            try
            {
                // Check if the provided model data is valid
                if (ModelState.IsValid)
                {
                    // Retrieve the original comment from the repository using its ID
                    var originalComment = await _commentRepository.GetCommentById(comment.CommentId);
                    if (originalComment == null)
                    {
                        _logger.LogError("[CommentController] Original comment not found for update, CommentId: {CommentId:0000}", comment.CommentId);
                        return NotFound("Original comment not found.");
                    }

                    // Get the current logged-in user
                    var user = await _userManager.GetUserAsync(User);
                    if (user == null)
                    {
                        // If no user is logged in, return an Unauthorized response
                        return Unauthorized("User is not logged in.");
                    }

                    // Ensure the logged-in user is the owner of the comment
                    if (originalComment.UserId != user.Id)
                    {
                        // If the user is not the owner, deny access to update the comment
                        return Forbid();
                    }

                    // Update the original comment's text with the new comment text
                    originalComment.CommentText = comment.CommentText;

                    // Call the repository to update the comment in the database
                    bool returnOk = await _commentRepository.Update(originalComment);
                    if (returnOk)
                    {
                        return RedirectToAction("Table", "Post"); // Redirect back to Table if the update is successful
                    }

                    _logger.LogError("[CommentController] Comment update failed for CommentId {CommentId:0000}.", comment.CommentId);
                }

                // Return the comment data to the view in case the update failed
                return View(comment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[CommentController] Error occurred while updating the comment.");
                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpGet]
        [Authorize]  // Only authorized users can attempt to delete comments
        public async Task<IActionResult> Delete(int id)
        {
            _logger.LogInformation("Delete GET action called for CommentId: {CommentId}", id);
            
            // Retrieve the comment to be deleted from the repository
            var comment = await _commentRepository.GetCommentById(id);
            if (comment == null)
            {
                _logger.LogError("[CommentController] Comment not found for CommentId {CommentId}", id);
                return BadRequest("Comment not found for the CommentId");
            }

            // Get the currently logged-in user
            var user = await _userManager.GetUserAsync(User);  
            if (user == null)
            {
                _logger.LogError("User not found during delete attempt.");
                return Unauthorized(); // Return Unauthorized if user is not found
            }

            // Check if the logged-in user owns the comment (only the owner can delete it)
            if (comment.UserId != user.Id)  
            {
                _logger.LogWarning("User {UserId} attempted to delete comment {CommentId} but does not have ownership.", user.Id, id);
                return Forbid();  
            }

            // Render the confirmation view for deletion
            _logger.LogInformation("Rendering confirmation view for deleting CommentId: {CommentId}", id);
            return View(comment);
        }

        [HttpPost]
        [Authorize]  // Only authorized users can delete comments
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            _logger.LogInformation("DeleteConfirmed POST action called for CommentId: {CommentId}", id);

            // Retrieve the comment to be deleted from the repository
            var comment = await _commentRepository.GetCommentById(id);
            if (comment == null)
            {
                _logger.LogError("[CommentController] Comment not found for CommentId {CommentId}", id);
                return BadRequest("Comment not found for the CommentId");
            }

            // Get the currently logged-in user
            var user = await _userManager.GetUserAsync(User);  
            if (user == null)
            {
                _logger.LogError("User not found during delete confirmation.");
                return Unauthorized(); // Return Unauthorized if user is not found
            }

            // Check if the logged-in user owns the comment (only the owner can delete it)
            if (comment.UserId != user.Id)
            {
                _logger.LogWarning("User {UserId} attempted to delete comment {CommentId} but is not the owner.", user.Id, id);
                return Forbid();  
            }

            // Attempt to delete the comment through the repository
            bool returnOk = await _commentRepository.Delete(id);
            if (!returnOk)
            {
                _logger.LogError("[CommentController] Comment deletion failed for CommentId {CommentId}", id);
                return BadRequest("Comment deletion failed");
            }

            _logger.LogInformation("Successfully deleted CommentId: {CommentId}", id);

            // Redirect back to the previous page after successful deletion
            return Redirect(Request.Headers["Referer"].ToString());
        }
    }
}

