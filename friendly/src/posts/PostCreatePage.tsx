import React, { FC } from 'react';  // Import React and FC type from 'react' for typing the component
import { useNavigate } from 'react-router-dom';  // Import the 'useNavigate' hook for navigation between pages
import PostForm from './PostForm';  // Import the PostForm component to render the form for creating a post
import * as PostService from './PostService';  // Import the PostService to interact with the backend for post creation

const PostCreatePage: FC = () => {
  const navigate = useNavigate();  // Create a navigate function to handle page navigation programmatically

  // Function to handle post creation after the form is submitted
  const handlePostCreated = async (formData: FormData) => {
    try {
      // Call the createPost method from PostService to create a new post with the provided form data
      const postData = await PostService.createPost(formData);

      console.log('Post created successfully:', postData);  
      navigate('/posts');  // Navigate to the posts list page after successful post creation
    } catch (error) {
      console.error('Error creating post:', error);  
    }
  };

  return (
    <div>
      <h2>Create New Post</h2> 
      <PostForm onPostChanged={handlePostCreated} /> 
    </div>
  );
};

export default PostCreatePage;  // Export the component