import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User } from '../types/user'; 
import { Post } from '../types/post'; 
import * as UserService from './UserService';
import * as PostService from '../posts/PostService';

const API_URL = 'http://localhost:5062';

const UserDetails: React.FC = () => {
  const { id } = useParams<Record<string, string>>(); // Get user ID as a string from the route params
  const [user, setUser] = useState<User | null>(null); // State to hold user details
  const [posts, setPosts] = useState<Post[]>([]); // State to hold the user's posts
  const [loading, setLoading] = useState<boolean>(false); // State to manage loading spinner
  const [error, setError] = useState<string | null>(null); // State to hold error messages

  // Fetch user details based on the `id` param
  const fetchUserDetails = useCallback(async () => {
    setLoading(true); // Indicate loading starts
    setError(null); // Reset any previous error message

    try {
      if (!id) throw new Error("User ID is missing or invalid."); // Ensure ID is valid
      const userData = await UserService.fetchUserById(id); // Fetch user data from service
      setUser(userData); // Update state with user details
    } catch (error) {
      console.error(`Error fetching user details: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setError('Failed to fetch user details.'); // Set error message for UI
    } finally {
      setLoading(false); // Stop loading indicator
    }
  }, [id]);

  // Fetch posts and filter them for the current user
  const fetchUserPosts = useCallback(async () => {
    try {
      if (!id) throw new Error("User ID is missing or invalid."); // Ensure ID is valid
      const allPosts = await PostService.fetchPosts(); // Fetch all posts from service
      const userPosts = allPosts.filter((post: Post) => post.userId === id); // Filter posts by userId
      setPosts(userPosts); // Update state with filtered posts
    } catch (error) {
      console.error(`Error fetching posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setError('Failed to fetch posts.'); // Set error message for UI
    }
  }, [id]);

  // Fetch both user details and posts when the component mounts or `id` changes
  useEffect(() => {
    fetchUserDetails();
    fetchUserPosts();
  }, [id, fetchUserDetails, fetchUserPosts]);

  // Render loading state
  if (loading) {
    return <p>Loading...</p>;
  }

  // Render error state
  if (error) {
    return <p>{error}</p>;
  }

  // Render if user data is not found
  if (!user) {
    return <p>No user data found.</p>;
  }

  return (
    <div className="container">
      <div className="row gx-5">
        {/* Left column for user details */}
        <div className="col-4 text-center">
          {/* Display user's profile image or a default image if not available */}
          <img
            alt={`${user.userName} profile`}
            src={user.profileImageUrl ? `${API_URL}${user.profileImageUrl}` : '/uploads/profile-images/defaultprofileimage.jpg'}
            className="img-fluid rounded-circle mb-3"
            style={{ width: '200px', height: '200px', objectFit: 'cover' }} // Ensure image fits properly
          />
          <h4>{user.userName}</h4> {/* Display user's username */}
          <table className="table table-bordered">
            <tbody>
              <tr>
                <th>Name</th>
                <td>{user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}` : <i>Unknown</i>}</td>
              </tr>
              <tr>
                <th>Email</th>
                <td>{user.email}</td>
              </tr>
              <tr>
                <th>Phone Number</th>
                <td>{user.phoneNumber || <i>Missing</i>}</td>
              </tr>
            </tbody>
          </table>
          <div>
            {/* Navigation buttons */}
            <Link to="/posts" className="btn btn-secondary me-2">Back to Posts</Link>
            <Link to="/users" className="btn btn-secondary">Back to Users</Link>
          </div>
        </div>

        {/* Right column for user's posts */}
        <div className="col-8">
          <div className="row">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.postId} className="col-md-6 mb-4">
                  <div className="card">
                    {/* Display post image or placeholder if not available */}
                    <img
                      src={`${API_URL}${post.postImagePath}`}
                      alt={post.caption}
                      className="card-img-top"
                      style={{ height: '200px', objectFit: 'cover' }} // Ensure image fits properly
                    />
                    <div className="card-body">
                      <p className="card-text">{post.caption}</p> {/* Post caption */}
                      <p><small className="text-muted">{post.postDate}</small></p> {/* Post date */}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p><i>No posts yet</i></p> // Indicate if the user has no posts
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;