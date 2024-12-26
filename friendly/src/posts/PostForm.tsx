import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { User } from '../types/user'; 
import * as UserService from '../users/UserService'; // Import UserService

interface PostFormProps {
  onPostChanged: (formData: FormData) => void;
  postId?: string; // postId is optional
}

const PostForm: React.FC<PostFormProps> = ({ onPostChanged, postId }) => {
  const [caption, setCaption] = useState<string>(''); // State for caption
  const [postImage, setPostImage] = useState<File | null>(null); // State for storing the file
  const [users, setUsers] = useState<User[]>([]); // State for users
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const fetchedUsers = await UserService.fetchUsers(); // Use UserService to fetch users
      setUsers(fetchedUsers); // Set fetched users in state
    } catch (err: any) {
      console.error('Error fetching data:', err.message);
      setError('Failed to fetch users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(); // Fetch users on component mount
  }, []);

  const onCancel = () => {
    navigate(-1); // Navigate back one step in the history
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // Get the first file
    if (file) {
      const validFileTypes = ['image/png', 'image/jpeg', 'image/jpg']; // Allowed file types
      if (!validFileTypes.includes(file.type)) {
        setError('Invalid file type. Please upload a PNG, JPEG, or JPG image.');
        setPostImage(null); // Reset the file if invalid
      } else {
        setPostImage(file); // Store the valid file in state
        setError(null); // Clear the error if file is valid
      }
    }
  };  

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    if (!postImage) {
      setError('Please upload an image.');
      return;
    }
  
    setError(null);
  
    // Construct FormData to include file upload and other fields
    const user = users.find((user) => user.userName === 'baifanz');
    if (!user) {
      setError('User with username "baifanz" not found');
      return;
    }
  
    const formData = new FormData();
  
    // Append the caption and the post image to the FormData
    formData.append('caption', caption);  // Ensure the caption is added
    formData.append('postImage', postImage);  // Ensure the image is added
  
    // Append the userId (assuming you have user data)
    formData.append('userId', user.id.toString());
  
    // If postId exists (in case of editing), append postId as well
    if (postId) {
      formData.append('postId', postId);
    }
  
    // Pass the FormData to the parent component
    onPostChanged(formData);
  };  

  return (
    <Form onSubmit={handleSubmit} encType="multipart/form-data">
      <Form.Group controlId="formCaption">
        <Form.Label>Caption</Form.Label>{/* Label for the caption input */}
        <Form.Control
          type="text"
          placeholder="Enter Caption"
          value={caption}  // Controlled input for caption state
          onChange={(e) => setCaption(e.target.value)}  // Handle caption change
          required
          pattern="[0-9a-zA-ZæøåÆØÅ. \-]{0,200}"  // Input pattern for allowed characters
          title="The Caption must be numbers or letters and between 0 to 200 characters."  // Tooltip for pattern validation
        />
      </Form.Group>

      <Form.Group controlId="formPostImage">
        <Form.Label>Upload Image</Form.Label>{/* Label for the file input */}
        <Form.Control
          type="file"
          accept="image/*"  // Allow all image file types
          onChange={handleFileChange}  // Handle file input change
          required  // Make this field required
        />
      </Form.Group>

      {loading && <p>Loading users...</p>}{/* Show loading message while fetching users */}
      {error && <p style={{ color: 'red' }}>{error}</p>}{/* Display error message if any error occurs */}

      <div className="my-2">
        <Button variant="primary" type="submit">Create</Button>{/* Button to submit the form and create the post */}
        <Button variant="secondary" onClick={onCancel} className="ms-2">Cancel</Button>{/* Button to cancel and go back */}
      </div>
    </Form>
  );
};

export default PostForm;  // Export the PostForm component