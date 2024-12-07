import API_URL from '../apiConfig'; // Update the path if necessary

const headers = {
  'Content-Type': 'application/json',
};

const handleResponse = async (response: Response) => {
  if (response.ok) { 
    if (response.status === 204) { // Detele returns 204 No content
      return null;
    }
    return response.json(); // other returns response body as JSON
  } else {
    const errorText = await response.text();
    throw new Error(errorText || 'Network response was not ok');
  }
};

// Get post list
export const fetchPosts = async () => {
  const response = await fetch(`${API_URL}/api/PostAPI/postlist`);
  return handleResponse(response);
};

// Get post by id
export const fetchPostById = async (postId: string) => {
  const response = await fetch(`${API_URL}/api/PostAPI/post/${postId}`);
  return handleResponse(response);
};

// Create post
export const createPost = async (formData: FormData) => {
  const response = await fetch(`${API_URL}/api/PostAPI/create`, {
    method: 'POST',
    body: formData,  // Send FormData directly without Content-Type header
  });

  return handleResponse(response);
};

// Update post
export const updatePost = async (postId: number, post: any) => {
  const response = await fetch(`${API_URL}/api/PostAPI/update/${postId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(post),
  });
  return handleResponse(response);
};

// Delete post
export const deletePost = async (postId: number) => {
  const response = await fetch(`${API_URL}/api/PostAPI/delete/${postId}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};

// Get likes by PostId
export const fetchLikesByPostId = async (postId: string) => {
    const response = await fetch(`${API_URL}/api/LikeAPI/likes/${postId}`);
    return handleResponse(response);
};

// Create like
export const createLike = async (likeData: { postId: number; userId: string }) => {
  const response = await fetch(`${API_URL}/api/LikeAPI/create`, {
      method: 'POST',
      headers,
      body: JSON.stringify(likeData), // Passing the likeData object
  });
  return handleResponse(response);
};

// Delete like
export const deleteLike = async (likeData: { postId: number; userId: string }) => {
  const response = await fetch(`${API_URL}/api/LikeAPI/delete`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify(likeData), // Passing the likeData object
  });
  return handleResponse(response);
};