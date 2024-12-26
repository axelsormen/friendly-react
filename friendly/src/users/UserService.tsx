import API_URL from '../apiConfig'; // Update the path if necessary

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

// Get user list
export const fetchUsers = async () => {
  const response = await fetch(`${API_URL}/api/UserAPI/userlist`);
  return handleResponse(response);
};

// Get user by id
export const fetchUserById = async (userId: string) => {
  const response = await fetch(`${API_URL}/api/UserAPI/user/${userId}`);
  return handleResponse(response);
};
