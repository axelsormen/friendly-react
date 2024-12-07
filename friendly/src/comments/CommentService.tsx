import API_URL from '../apiConfig'; // Update the path if necessary

const headers = {
  'Content-Type': 'application/json',
};

const handleResponse = async (response: Response) => {
  if (response.ok) { 
    if (response.status === 204) { // Detele returns 204 No content
      return null;
    }
    return response.json(); // Other returns response body as JSON
  } else {
    const errorText = await response.text();
    throw new Error(errorText || 'Network response was not ok');
  }
};

// Get comment list
export const fetchComments = async () => {
  const response = await fetch(`${API_URL}/api/CommentAPI/commentlist`);
  return handleResponse(response);
};

// Get comment by id
export const fetchCommentById = async (commentId: string) => {
  const response = await fetch(`${API_URL}/api/CommentAPI/comment/${commentId}`);
  return handleResponse(response);
};

// Create comment
export const createComment = async (comment: any) => {
  const response = await fetch(`${API_URL}/api/CommentAPI/create`, {
    method: 'POST',
    headers,
    body: JSON.stringify(comment),
  });
  return handleResponse(response);
};

// Update comment
export const updateComment = async (commentId: number, comment: any) => {
  const response = await fetch(`${API_URL}/api/CommentAPI/update/${commentId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(comment),
  });
  return handleResponse(response);
};

// Delete comment
export const deleteComment = async (commentId: number) => {
  const response = await fetch(`${API_URL}/api/CommentAPI/delete/${commentId}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};