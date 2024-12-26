using Microsoft.EntityFrameworkCore;
using friendly.DAL;
using Serilog;
using Serilog.Events;
using friendly.Models;
using Microsoft.AspNetCore.Identity;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddNewtonsoftJson(options => {
    options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
});

builder.Services.AddIdentity<User, IdentityRole>(options =>
{
     // Password settings
     options.Password.RequireDigit = true;
     options.Password.RequiredLength = 8;
     options.Password.RequireNonAlphanumeric = true;
     options.Password.RequireUppercase = true;
     options.Password.RequireLowercase = true;
     options.Password.RequiredUniqueChars = 6;

     // Lockout settings
     options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(60);
     options.Lockout.MaxFailedAccessAttempts = 5;
     options.Lockout.AllowedForNewUsers = true;

     // User settings
     options.User.RequireUniqueEmail = true;

     // Sign-in settings
    // options.SignIn.RequireConfirmedAccount = false; // Set to true if you want email confirmation
 })
 .AddEntityFrameworkStores<PostDbContext>()
 .AddDefaultTokenProviders();

 builder.Services.ConfigureApplicationCookie(options =>
 {
     options.LoginPath = "/Identity/Account/Login";
 });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<PostDbContext>(options => {
    options.UseSqlite(builder.Configuration["ConnectionStrings:PostDbContextConnection"]);});

builder.Services.AddControllers();
builder.Services.AddCors(options =>
        {
            options.AddPolicy("CorsPolicy",
                builder => builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
        });

builder.Services.AddScoped<IPostRepository, PostRepository>();
builder.Services.AddScoped<ICommentRepository, CommentRepository>();
builder.Services.AddScoped<ILikeRepository, LikeRepository>();

builder.Services.AddRazorPages();
builder.Services.AddSession(options =>
{
     options.Cookie.Name = ".AdventureWorks.Session";
     options.IdleTimeout = TimeSpan.FromSeconds(1800); // 30 minutes
     options.Cookie.IsEssential = true;
 });

var loggerConfiguration = new LoggerConfiguration()
    .MinimumLevel.Information() // levels: Trace< Information < Warning < Erorr < Fatal
    .WriteTo.File($"APILogs/app_{DateTime.Now:yyyyMMdd_HHmmss}.log")
    .Filter.ByExcluding(e => e.Properties.TryGetValue("SourceContext", out var value) &&
                            e.Level == LogEventLevel.Information &&
                            e.MessageTemplate.Text.Contains("Executed DbCommand"));
var logger = loggerConfiguration.CreateLogger();
builder.Logging.AddSerilog(logger);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    DBInit.Seed(app);
    app.UseSwagger();
    app.UseSwaggerUI();
    
}
app.UseStaticFiles();
app.UseRouting();
app.UseCors("CorsPolicy");
app.MapControllerRoute(name: "api", pattern: "{controller}/{action=Index}/{id?}");
app.UseSession();
app.UseAuthentication();
app.UseAuthorization();
app.MapDefaultControllerRoute();
app.MapRazorPages();
    
app.Run();