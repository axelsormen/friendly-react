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
    public class LikeAPIController : ControllerBase
    {
        private readonly ILikeRepository _likeRepository; // Repository to interact with likes
        private readonly ILogger<LikeAPIController> _logger; // Logger for logging information and errors

        public LikeAPIController(ILikeRepository likeRepository, ILogger<LikeAPIController> logger)
        {
            _likeRepository = likeRepository;
            _logger = logger;
        }

        [HttpGet("likes/{postId}")]
        public async Task<IActionResult> GetLikesCount(int postId)
        {
            try
            {
                // Get like count for the given postId from the repository
                var count = await _likeRepository.GetLikesCount(postId);
                _logger.LogInformation("Like count retrieved successfully for PostId: {PostId}, Count: {Count}", postId, count);
                return Ok(count); // Return the like count in the response
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while retrieving the like count for PostId: {PostId}", postId);
                return BadRequest("Unable to retrieve like count"); // Return error message if exception occurs
            }
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateLike([FromBody] LikeDto likeDTO)
        {
            // Validate the like data from the request body
            if (likeDTO == null || likeDTO.PostId <= 0 || string.IsNullOrEmpty(likeDTO.UserId))
                return BadRequest("Invalid like data");

            var like = new Like
            {
                PostId = likeDTO.PostId,
                UserId = likeDTO.UserId
            };

            try
            {
                // Try to create the like via the repository
                bool result = await _likeRepository.Create(like);

                // If the like already exists, return conflict response
                if (!result)
                {
                    _logger.LogWarning("Like already exists for postId {PostId} and userId {UserId}", likeDTO.PostId, likeDTO.UserId);
                    return Conflict("Like already exists");
                }

                // Log and return success message if like is created
                _logger.LogInformation("Like created successfully for PostId: {PostId} and UserId: {UserId}", likeDTO.PostId, likeDTO.UserId);
                return Ok(new { message = "Like created successfully" });
            }
            catch (Exception ex)
            {
                // Catch and log errors
                _logger.LogError(ex, "An error occurred while creating the like.");
                return BadRequest("Unable to process Like data"); // Return error message if exception occurs
            }
        }

        // Endpoint to delete an existing like for a post
        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteLike([FromBody] LikeDto likeDTO)
        {
            // Validate the unlike data from the request body
            if (likeDTO == null || likeDTO.PostId <= 0 || string.IsNullOrEmpty(likeDTO.UserId))
                return BadRequest("Invalid unlike data");

            try
            {
                // Attempt to delete the like using the repository
                bool returnOk = await _likeRepository.DeleteByPostAndUser(likeDTO.PostId, likeDTO.UserId);

                // If deletion fails, return error
                if (!returnOk)
                {
                    _logger.LogError("Like deletion failed for postId {PostId} and userId {UserId}", likeDTO.PostId, likeDTO.UserId);
                    return BadRequest("Like deletion failed");
                }

                _logger.LogInformation("Like deleted successfully for PostId: {PostId} and UserId: {UserId}", likeDTO.PostId, likeDTO.UserId);
                return Ok(); // Return success response
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while deleting the like.");
                return BadRequest("Unable to process unlike data"); // Return error message if exception occurs
            }
        }
    }

    public class LikeController : Controller
    {
        private readonly ILikeRepository _likeRepository; // Repository to interact with the Like data
        private readonly ILogger<LikeController> _logger; // Logger for logging errors and information

        public LikeController(ILikeRepository likeRepository, ILogger<LikeController> logger)
        {
            _likeRepository = likeRepository;
            _logger = logger;
        }

        [HttpPost]
        [Authorize] // Only authorized users can create a like
        public async Task<IActionResult> Create(int postId, string userId)
        {
            var like = new Like
            {
                PostId = postId, // Assign the PostId for the like
                UserId = userId  // Assign the UserId for the like
            };

            _logger.LogInformation("Create action called with Like data: {@Like}", like);

            try
            {
                // Try to create the like using the repository
                bool result = await _likeRepository.Create(like);

                if (!result)
                {
                    _logger.LogWarning("Like already exists for postId {PostId} and userId {UserId}", postId, userId);
                    return Conflict("Like already exists");
                }

                _logger.LogInformation("Like created successfully with ID: {LikeId}", like.LikeId);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while creating the like.");
                return BadRequest("Unable to process Like data");
            }
        }

        [HttpPost]
        [Authorize] // Only authorized users can delete a like
        public async Task<IActionResult> DeleteConfirmed(int postId, string userId)
        {
            // Try to delete the like from the repository
            bool returnOk = await _likeRepository.DeleteByPostAndUser(postId, userId);

            if (!returnOk)
            {
                _logger.LogError("[LikeController] Like deletion failed for postId {PostId} and userId {UserId}", postId, userId);
                return BadRequest("Like deletion failed");
            }

            _logger.LogInformation("[LikeController] Like deleted successfully for postId {PostId} and userId {UserId}", postId, userId);
            return Ok();
        }

        [HttpGet]
        [Authorize] // Only authorized users can view the like count
        public async Task<IActionResult> GetLikesCount(int postId)
        {
            try
            {
                // Retrieve the like count from the repository
                var count = await _likeRepository.GetLikesCount(postId);
                _logger.LogInformation("Like count retrieved successfully for PostId: {PostId}, Count: {Count}", postId, count);
                
                return Ok(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while retrieving the like count for PostId: {PostId}", postId);
                return BadRequest("Unable to retrieve like count");
            }
        }
    }
}