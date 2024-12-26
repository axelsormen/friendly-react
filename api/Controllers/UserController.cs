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

namespace friendly.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserAPIController : ControllerBase
{
    private readonly UserManager<User> _userManager; // UserManager for managing users (part of ASP.NET Identity)
    private readonly IPostRepository _postRepository; // Repository to interact with posts (not used in this controller, but may be injected for future functionality)
    private readonly ILogger<UserAPIController> _logger; // Logger for logging information and errors

    public UserAPIController(UserManager<User> userManager, IPostRepository postRepository, ILogger<UserAPIController> logger)
    {
        _userManager = userManager;
        _postRepository = postRepository;
        _logger = logger;
    }

    [HttpGet("userlist")]
    public async Task<IActionResult> UserList()
    {
        try
        {
            // Fetch all users from UserManager (ASP.NET Identity)
            var users = await _userManager.Users.ToListAsync();

            // Check if no users are found or if the list is empty
            if (users == null || !users.Any())
            {
                _logger.LogError("[UserAPIController] User list not found.");
                return NotFound("User list not found");
            }

            // Map the User entities to UserDto (Data Transfer Object) for the response
            var userDtos = users.Select(user => new UserDto
            {
                Id = user.Id, 
                UserName = user.UserName, 
                FirstName = user.FirstName, 
                LastName = user.LastName, 
                ProfileImageUrl = user.ProfileImageUrl, 
                PhoneNumber = user.PhoneNumber,
                Email = user.Email
            });

            return Ok(userDtos); // Return the list of user DTOs as the response
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[UserAPIController] Error occurred while fetching users.");
            return StatusCode(500, "Internal server error.");
        }
    }

    [HttpGet("user/{id}")]
    public async Task<IActionResult> GetUserById(string id)
    {
        try
        {
            // Fetch user by ID using UserManager's FindByIdAsync method
            var user = await _userManager.FindByIdAsync(id);

            // Check if user is not found
            if (user == null)
            {
                _logger.LogError("[UserAPIController] User not found for UserId {UserId}", id);
                return NotFound("User not found");
            }

            // Map the User entity to UserDto for the response
            var userDto = new UserDto
            {
                Id = user.Id,
                UserName = user.UserName, 
                FirstName = user.FirstName, 
                LastName = user.LastName,  
                ProfileImageUrl = user.ProfileImageUrl,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber, 
                EmailConfirmed = user.EmailConfirmed
            };

            return Ok(userDto); // Return the user details in the response
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[UserAPIController] Error occurred while fetching user with UserId {UserId}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}
   public class UserController : Controller
   {
       private readonly UserManager<User> _userManager; // UserManager for managing users
       private readonly IPostRepository _postRepository; // Repository to interact with posts
       private readonly ILogger<UserController> _logger; // Logger for logging information and errors

       public UserController(UserManager<User> userManager, IPostRepository postRepository, ILogger<UserController> logger)
       {
           _userManager = userManager;
           _postRepository = postRepository;
           _logger = logger;
       }

       // Action to display all users in a table
       public async Task<IActionResult> Table()
       {
           try
           {
               // Fetch all users asynchronously from the database
               var users = await _userManager.Users.ToListAsync();
              
               if (users == null || !users.Any()) // Check if no users are found
               {
                   _logger.LogError("[UserController] No users found in the database.");
                   return NotFound("User list not found.");
               }

               // Create a ViewModel that holds the list of users for the table view
               var usersViewModel = new UsersViewModel(users, "Table");

               return View(usersViewModel);
           }
           catch (Exception ex)
           {
               _logger.LogError(ex, "[UserController] Error occurred while fetching users for Table view.");
               return StatusCode(500, "Internal server error.");
           }
       }

       // Action to display details of a specific user
       public async Task<IActionResult> Details(string id)
       {
           try
           {
               if (string.IsNullOrEmpty(id)) // Check if the user ID is invalid or missing
               {
                   _logger.LogError("[UserController] Invalid or missing user ID.");
                   return BadRequest("User ID cannot be null or empty."); // Return a BadRequest if the ID is invalid
               }

               // Find the user by ID using UserManager
               var user = await _userManager.FindByIdAsync(id);
               if (user == null) // If user not found
               {
                   _logger.LogError("[UserController] User not found for the UserId {UserId}", id);
                   return NotFound($"User with ID {id} not found.");
               }

               // Fetch the posts associated with this user
               var posts = await _postRepository.GetPostsByUserId(id);
               if (posts == null || !posts.Any()) // If no posts found for the user
               {
                   _logger.LogWarning("[UserController] No posts found for the UserId {UserId}. Returning empty list.", id);
                   posts = new List<Post>();
               }

               // Create a ViewModel to pass user details and their posts to the view
               var viewModel = new UsersViewModel(user, posts, "User Details");


               return View(viewModel); // Return the View with the ViewModel
           }
           catch (Exception ex)
           {
               _logger.LogError(ex, "[UserController] Error occurred while fetching user details for UserId {UserId}.", id);
               return StatusCode(500, "Internal server error.");
           }
       }
   }