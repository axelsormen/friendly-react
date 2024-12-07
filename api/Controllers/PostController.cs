using Microsoft.AspNetCore.Mvc;
using friendly.DAL;
using friendly.Models;
using friendly.ViewModels;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using System.IO;
using System.Linq;
using friendly.DTOs;

namespace friendly.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PostAPIController : Controller
{
    private readonly IPostRepository _postRepository; // Repository for interacting with posts
    private readonly ILogger<PostController> _logger; // Logger for logging events and errors

    public PostAPIController(IPostRepository postRepository, ILogger<PostController> logger)
    {
        _postRepository = postRepository;
        _logger = logger;
    }

    [HttpGet("postlist")]
    public async Task<IActionResult> PostList()
    {
        try
        {
            // Retrieve all posts from the repository
            var posts = await _postRepository.GetAll();

            // If no posts found, log error and return NotFound
            if (posts == null)
            {
                _logger.LogError("[PostAPIController] Post list not found while executing _postRepository.GetAll()");
                return NotFound("Post list not found");
            }

            // Convert posts to PostDto objects for the response
            var postDtos = posts.Select(post => new PostDto
            {
                PostId = post.PostId,
                PostImagePath = post.PostImagePath,
                Caption = post.Caption,
                PostDate = post.PostDate,
                UserId = post.UserId,
            });

            return Ok(postDtos); // Return posts in response
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[PostAPIController] Error occurred while retrieving post list.");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("post/{id}")]
    public async Task<IActionResult> GetPostById(int id)
    {
        try
        {
            // Retrieve the post by ID
            var post = await _postRepository.GetPostById(id);

            // If the post is not found, log error and return NotFound
            if (post == null)
            {
                _logger.LogError("[PostAPIController] Post not found for PostId {PostId}", id);
                return NotFound("Post not found");
            }

            // Convert the post to PostDto for the response
            var postDto = new PostDto
            {
                PostId = post.PostId,
                PostImagePath = post.PostImagePath,
                Caption = post.Caption,
                PostDate = post.PostDate,
                UserId = post.UserId,
            };

            return Ok(postDto); // Return the post details
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[PostAPIController] Error occurred while fetching post with PostId {PostId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("create")]
    public async Task<IActionResult> CreatePost([FromForm] PostDto postDto, [FromForm] IFormFile postImage)
    {
        try
        {
            // Validate model state
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState); // Return validation errors if any
            }

            // Check if image is provided
            if (postImage == null || postImage.Length == 0)
            {
                return BadRequest("An image file is required.");
            }

            // Save the image file to the server's upload directory
            var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");
            if (!Directory.Exists(uploadsDir))
            {
                Directory.CreateDirectory(uploadsDir); // Create directory if it doesn't exist
            }

            // Generate a unique file name and save the image
            var uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(postImage.FileName);
            var filePath = Path.Combine(uploadsDir, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await postImage.CopyToAsync(stream); // Save the uploaded file
            }

            // Create the Post model to be saved
            var post = new Post
            {
                Caption = postDto.Caption,
                PostImagePath = $"/uploads/{uniqueFileName}",
                PostDate = DateTime.Now.ToString(),
                UserId = postDto.UserId,
            };

            // Save the post to the repository
            bool isCreated = await _postRepository.Create(post);

            // Log failure if creation fails and return error
            if (!isCreated)
            {
                _logger.LogError("[PostAPIController] Post creation failed.");
                return StatusCode(500, "Post creation failed.");
            }

            // Return the created post details
            var createdPostDto = new PostDto
            {
                PostId = post.PostId,
                Caption = post.Caption,
                PostImagePath = post.PostImagePath,
                PostDate = post.PostDate,
                UserId = post.UserId
            };

            return CreatedAtAction(nameof(PostList), new { id = post.PostId }, createdPostDto); // Return created post
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[PostAPIController] Error occurred while creating post.");
            return StatusCode(500, "Internal server error.");
        }
    }

    [HttpPut("update/{id}")]
    public async Task<IActionResult> UpdatePost(int id, [FromBody] PostDto postDto)
    {
        try
        {
            // Retrieve the post to be updated
            var post = await _postRepository.GetPostById(id);

            // If the post is not found, log error and return NotFound
            if (post == null)
            {
                _logger.LogError("[PostAPIController] Post not found for PostId {PostId}", id);
                return NotFound("Post not found");
            }

            // Update only the caption field
            post.Caption = postDto.Caption;

            // Save the updated post to the repository
            bool isUpdated = await _postRepository.Update(post);

            // Log failure if update fails and return error
            if (!isUpdated)
            {
                _logger.LogError("[PostAPIController] Post update failed for PostId {PostId}", id);
                return StatusCode(500, "Post update failed");
            }

            // Return the updated post details
            var updatedPostDto = new PostDto
            {
                PostId = post.PostId,
                Caption = post.Caption,
                PostImagePath = post.PostImagePath, // Image path remains unchanged
                PostDate = post.PostDate,
                UserId = post.UserId,
            };

            return Ok(updatedPostDto); // Return the updated post
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[PostAPIController] Error occurred while updating post with PostId {PostId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("delete/{id}")]
    public async Task<IActionResult> DeletePost(int id)
    {
        try
        {
            // Retrieve the post to be deleted
            var post = await _postRepository.GetPostById(id);

            // If the post is not found, log error and return NotFound
            if (post == null)
            {
                _logger.LogError("[PostAPIController] Post not found for PostId {PostId}", id);
                return NotFound("Post not found");
            }

            // Attempt to delete the post
            bool returnOk = await _postRepository.Delete(id);

            // Log failure if deletion fails
            if (!returnOk)
            {
                _logger.LogError("[PostAPIController] Post deletion failed for PostId {PostId}", id);
                return StatusCode(500, "Post deletion failed");
            }

            _logger.LogInformation("Successfully deleted PostId: {PostId}", id); // Log successful deletion
            return NoContent();  // Return 204 No Content on successful deletion
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[PostAPIController] Error occurred while deleting post.");
            return StatusCode(500, "Internal server error.");
        }
    }
}

public class PostController : Controller
{
    private readonly IPostRepository _postRepository; // Repository for interacting with the Post data
    private readonly ILogger<PostController> _logger; // Logger for logging errors and info
    private readonly UserManager<User> _userManager; // UserManager to access user data

    public PostController(IPostRepository postRepository, ILogger<PostController> logger, UserManager<User> userManager)
    {
        _postRepository = postRepository;
        _logger = logger;
        _userManager = userManager;
    }

    // Action to display posts in a table format
    public async Task<IActionResult> Table()
    {
        try
        {
            // Fetch all posts from the repository
            var posts = await _postRepository.GetAll();
            if (posts == null || !posts.Any())
            {
                _logger.LogError("[PostController] Post list not found or is empty while executing _postRepository.GetAll()");
                return NotFound("Post list not found.");
            }
            var postsViewModel = new PostsViewModel(posts, "Table"); // Create ViewModel for table view
            return View(postsViewModel);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[PostController] Error occurred while retrieving posts in Table action.");
            return StatusCode(500, "Internal server error.");
        }
    }

    // Action to display posts in a grid format
    public async Task<IActionResult> Grid()
    {
        try
        {
            // Fetch all posts from the repository
            var posts = await _postRepository.GetAll();
            if (posts == null || !posts.Any())
            {
                _logger.LogError("[PostController] Post list not found or is empty while executing _postRepository.GetAll()");
                return NotFound("Post list not found.");
            }
            var postsViewModel = new PostsViewModel(posts, "Grid"); // Create ViewModel for grid view
            return View(postsViewModel);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[PostController] Error occurred while retrieving posts in Grid action.");
            return StatusCode(500, "Internal server error.");
        }
    }

    [HttpGet]
    [Authorize] // Only authorized users can create a post
    public IActionResult Create()
    {
        return View(); // Return the view to create a post
    }

    [HttpPost]
    [Authorize] // Only authorized users can create a post
    public async Task<IActionResult> Create(Post post, IFormFile imageFile)
    {
        _logger.LogInformation("[PostController] Create method started.");

        try
        {
            // Get the logged-in user
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                _logger.LogError("[PostController] Unable to retrieve the logged-in user.");
                return Unauthorized("You need to be logged in to create a post.");
            }

            post.UserId = user.Id; // Assign the logged-in user ID to the post
            _logger.LogInformation("UserId assigned to post: {UserId}", post.UserId);

            // Handle image file if provided
            if (imageFile != null && imageFile.Length > 0)
            {
                _logger.LogInformation("[PostController] Image file received: {FileName}", imageFile.FileName);

                // Check file extension validity
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
                var fileExtension = Path.GetExtension(imageFile.FileName).ToLower();

                if (!allowedExtensions.Contains(fileExtension))
                {
                    _logger.LogWarning("[PostController] Invalid file extension: {FileExtension}", fileExtension);
                    ModelState.AddModelError("PostImagePath", "Only .jpg, .jpeg, and .png image formats are allowed.");
                    return View(post);
                }

                // Ensure uploads directory exists
                var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");
                if (!Directory.Exists(uploadsDir))
                {
                    _logger.LogInformation("[PostController] Uploads directory does not exist, creating directory.");
                    Directory.CreateDirectory(uploadsDir);
                }

                var uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(imageFile.FileName);
                var filePath = Path.Combine(uploadsDir, uniqueFileName);

                try
                {
                    // Save the image file to the specified location
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        _logger.LogInformation("[PostController] Saving file to {FilePath}", filePath);
                        await imageFile.CopyToAsync(stream);
                    }

                    // Set the file path for the post image
                    post.PostImagePath = $"/uploads/{uniqueFileName}";
                    _logger.LogInformation("[PostController] Image uploaded successfully, PostImagePath set to: {PostImagePath}", post.PostImagePath);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[PostController] Error while saving image.");
                    ModelState.AddModelError("PostImagePath", "An error occurred while saving the image.");
                }
            }
            else
            {
                _logger.LogWarning("[PostController] No image file received.");
                ModelState.AddModelError("PostImagePath", "An image file is required.");
            }

            post.PostDate = DateTime.Now.ToString(); // Set the post date
            _logger.LogInformation("[PostController] Post date set to: {PostDate}", post.PostDate);

            // Check if the model state is valid before attempting to create the post
            if (ModelState.IsValid)
            {
                _logger.LogInformation("[PostController] ModelState is valid. Attempting to create the post.");
                bool returnOk = await _postRepository.Create(post);
                if (returnOk)
                {
                    _logger.LogInformation("[PostController] Post created successfully. Redirecting to Table.");
                    return RedirectToAction(nameof(Table)); // Redirect to the Table view on success
                }
                else
                {
                    _logger.LogError("[PostController] Post creation failed in repository.");
                    ModelState.AddModelError("", "Post creation failed.");
                }
            }
            else
            {
                _logger.LogWarning("[PostController] ModelState is invalid.");
                foreach (var error in ModelState.Values.SelectMany(v => v.Errors))
                {
                    _logger.LogWarning("[PostController] Model error: {ErrorMessage}", error.ErrorMessage);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[PostController] Error occurred while creating post.");
            ModelState.AddModelError("", "An error occurred while creating the post.");
        }

        _logger.LogWarning("[PostController] Post creation failed {@post}", post);
        return View(post); // Return the view with the post if creation fails
    }

    [HttpGet]
    [Authorize] // Only authorized users can update a post
    public async Task<IActionResult> Update(int id)
    {
        try
        {
            var post = await _postRepository.GetPostById(id);
            if (post == null)
            {
                _logger.LogError("[PostController] Post not found when updating the PostId {PostId:0000}", id);
                return NotFound("Post not found for the PostId");
            }

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized("User is not logged in.");
            }

            if (post.UserId != user.Id)
            {
                return Forbid(); // Ensure only the post creator can update the post
            }

            return View(post); // Return the post data for editing
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[PostController] Error occurred while retrieving the post for update.");
            return StatusCode(500, "Internal server error.");
        }
    }

    [HttpPost]
    [Authorize] // Only authorized users can update a post
    public async Task<IActionResult> Update(Post post)
    {
        try
        {
            if (ModelState.IsValid)
            {
                var originalPost = await _postRepository.GetPostById(post.PostId);
                if (originalPost == null)
                {
                    _logger.LogError("[PostController] Original post not found for update, PostId: {PostId:0000}", post.PostId);
                    return NotFound("Original post not found.");
                }

                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                {
                    return Unauthorized("User is not logged in.");
                }

                if (originalPost.UserId != user.Id)
                {
                    return Forbid(); // Ensure only the post creator can update the post
                }

                originalPost.Caption = post.Caption; // Update the post's caption

                bool returnOk = await _postRepository.Update(originalPost);
                if (returnOk)
                    return RedirectToAction(nameof(Table)); // Redirect back to Table if the update is successful

                _logger.LogError("[PostController] Post update failed for PostId {PostId:0000}.", post.PostId);
            }

            return View(post); // Return the view if update fails
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[PostController] Error occurred while updating the post.");
            return StatusCode(500, "Internal server error.");
        }
    }

    [HttpGet]
    [Authorize] // Only authorized users can delete a post
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var post = await _postRepository.GetPostById(id);
            if (post == null)
            {
                _logger.LogError("[PostController] Post not found for the PostId {PostId:0000}", id);
                return NotFound("Post not found.");
            }

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized("User is not logged in.");
            }

            if (post.UserId != user.Id)
            {
                return Forbid(); // Ensure only the post creator can delete the post
            }

            return View(post); // Return the view to confirm post deletion
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[PostController] Error occurred while retrieving the post for deletion.");
            return StatusCode(500, "Internal server error.");
        }
    }

    [HttpPost]
    [Authorize] // Only authorized users can delete a post
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        try
        {
            var post = await _postRepository.GetPostById(id);
            if (post == null)
            {
                _logger.LogError("[PostController] Post not found for deletion, PostId: {PostId:0000}", id);
                return NotFound();
            }

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized("User is not logged in.");
            }

            if (post.UserId != user.Id)
            {
                return Forbid(); // Ensure only the post creator can delete the post
            }

            var result = await _postRepository.Delete(id); // Attempt to delete the post
            if (result)
            {
                _logger.LogInformation("[PostController] Post with PostId {PostId:0000} deleted successfully.", id);
                return RedirectToAction("Table"); // Redirect to Table after successful deletion
            }

            _logger.LogError("[PostController] Failed to delete post with PostId {PostId:0000}.", id);
            return NotFound(); // If deletion fails, return NotFound
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[PostController] Error occurred while deleting post with PostId {PostId:0000}.", id);
            return StatusCode(500, "Internal server error.");
        }
    }
}