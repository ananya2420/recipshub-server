Requirements: RecipeHub - Recipe Sharing Platform Dear Candidates, We are pleased to inform you that you have successfully passed the first round of the selection process!! 🎉 Your application and skills have impressed us, and we are excited to move forward with you in the next stages. This project is designed to assess your skills, creativity, and problem-solving abilities. It will help us understand how you approach challenges and your ability to deliver high-quality solutions.

PROJECT NAME RecipeHub — Recipe Sharing Platform PROJECT OVERVIEW RecipeHub is a platform where food enthusiasts can create, share, discover, and manage recipes. Users can publish their own recipes, browse recipes shared by others, save favorite recipes, and interact with the community. The platform creates a centralized space for recipe sharing and culinary inspiration.

HOW THE SYSTEM WORKS User Create and manage recipes A normal user can add 2 recipes (Highest). Become a premium member to unlock adding unlimited recipes (Check This) Browse All recipes Browse purchased recipes Save favorite recipes Update personal profile Filter recipes Admin Manage users Manage recipes Review reports Moderate platform activities

ENSURE THE FOLLOWING THINGS TO GET 100% MARK Minimum 20 meaningful client-side commits Minimum 12 meaningful server-side commits Include README file (client side) Secure Better Auth configuration using environment variables Secure MongoDB credentials using environment variables Fully responsive design Professional UI/UX No copied projects Proper error handling No reload issues on production routes

DEPLOYMENT GUIDELINE Live site should work perfectly No CORS issues No 404 issues No 504 issues Reloading any route should not throw errors Private routes should work after page refresh Logged-in users should remain authenticated

LAYOUT & PAGE STRUCTURE Navbar Public Routes Home Browse Recipes Login Register Authenticated/Protected Routes Dashboard Profile Footer Must contain: Logo Quick Links Social Links Copyright Contact Information MAIN PAGES Public Home Browse Recipes Recipe Details Login Register Private User Dashboard Overview My Recipes Add Recipe A normal user can add 2 recipes (Highest). Become a premium member to unlock adding unlimited recipes (Check This) My Favorites My purchased recipes Profile Admin Dashboard Overview Manage Users Manage Recipes Reports HOME PAGE Banner Section Include: Title Description CTA Button Dynamic Section 1 Featured Recipes Show the featured recipe cards (See Admin featured section) Card Data: Recipe Name Category Cuisine Preparation Time

Dynamic Section 2 Popular Recipes Show most liked recipes. Card Data: Recipe Name Likes Count Author Name

Additional Sections Implement 2 Extra static sections on your own

Animation Requirement Implement Framer Motion/Motion animation in at least one section.

BROWSE ALL RECIPE PAGE Show all recipes in card format. It includes: Necessary Information View Details Button

RECIPE DETAILS PAGE Display complete recipe information. It includes: Necessary Information Like Count Purchase Button On clicking it, use Stripe payment to ensure buying that recipe Like Button On clicking it, it will increase like count and show it in the details page Report Button On clicking it, it will show a modal and user can report the recipe Favorite Button On clicking it, it will be added to the favorite recipe

AUTHENTICATION SYSTEM Login Fields: Email Password Features: Credential Login Google Login After Login: Redirect to intended route Otherwise Home page Registration Fields: Name Email Image URL Password Password Rules: Minimum 6 characters One uppercase letter One lowercase letter

USER DASHBOARD Dashboard Overview Show: Total Recipes Total Favorites Total Likes Received Show Premium badge based on payment

ADD RECIPE Fields: Recipe Name Recipe Image Upload (imgbb) Category Cuisine Type Difficulty Level Preparation Time Ingredients Instructions Store in: recipes Collection

MY RECIPES User can: View Own Recipes Update Recipes Delete Recipes

MY PURCHASED RECIPES Show all purchased recipes of the logged in user in a card/table format. Users can: Necessary Information View Details Button

FAVORITES Show all favorite recipes of the logged in user in a card/table format. Users can: Remove Recipe from Favorites View Details Button Store in: favorites Collection

PROFILE Update: Name Image PREMIUM USER FEATURE Users must purchase a premium membership to unlock: Premium profile badge Unlimited Add Recipe Use Stripe Checkout. Payment Success Page After successful payment: Show confirmation Save transaction

Store in: payments Collection ADMIN DASHBOARD Dashboard Overview Show: Total Users Total Recipes Total Premium Members Total Reports

MANAGE USERS Admin can: View Users Block User Unblock User

MANAGE RECIPES Show all recipes of all users in a table format. Admin can: Delete Recipe Edit Recipe Feature Recipe. After adding to the featured, show it in the main page. (See Featured Section)

RECIPE REPORTS Users can report recipes. Reasons: Spam Offensive Content Copyright Issue Admin can: Remove Recipe Dismiss Report

TRANSACTIONS Show: User Amount Date Payment Status Transaction ID

LOADING PAGE Show loader while: Authentication Data Fetching

ERROR PAGE Custom 404 Page Include: Illustration Error Message Back Home Button

CHALLENGE REQUIREMENTS Dark / Light Theme Toggle Filter Recipes Using: Category Use MongoDB $in JWT Authentication Implement: Token Generation Store JWT in HTTPOnly Cookie Verify Token Middleware Protect Dashboard APIs

Pagination Implement Pagination On any page Server-side pagination required.

OPTIONAL REQUIREMENTS Recipe Bookmark Feature Recipe Rating System Recipe Analytics Dashboard

DATABASE ARCHITECTURE users name email image role isBlocked isPremium createdAt updatedAt recipes recipeName recipeImage category cuisineType difficultyLevel preparationTime ingredients instructions authorId authorName authorEmail likesCount isFeatured status createdAt updatedAt

favorites userEmail userId recipeId addedAt

reports recipeId reporterEmail reason status createdAt payments userEmail userId amount recipeId transactionId paymentStatus paidAt

WHAT TO SUBMIT Admin Email Admin Password Live Site Link Github Repository (Server) Github Repository (Client)

Live Link: https://recipshub-server.vercel.app


