import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Post } from '../types/post'; 
import { Comment } from '../types/comment'; 
import { User } from '../types/user'; 

interface PostGridProps {
  posts: Post[];
  users: User[];
  comments: Comment[];
}

const API_URL = 'http://localhost:5062'; // Base URL for API requests

const PostGrid: React.FC<PostGridProps> = ({ posts, users, comments }) => {
  return (
    <Row>
      {posts.map((post) => {
        // Find the user associated with the post by matching userId
        const postUser = users.find((user) => user.id === post.userId);
        
        // Filter comments to find the ones related to the current post
        const postComments = comments.filter((comment) => comment.postId === post.postId);

        return (
          <Col md={4} className="mb-4" key={post.postId}>
            <Card>
              {/* Display post image with a fixed height and cover style */}
              <Card.Img
                variant="top"
                src={`${API_URL}${post.postImagePath}`}
                alt={post.caption} 
                style={{ height: '400px', objectFit: 'cover' }} 
              />
              <Card.Body>
                {/* User info (profile image and name) along with the post caption */}
                <div className="d-flex align-items-center mb-3">
                  {postUser && (
                    <img
                      src={`${API_URL}${postUser.profileImageUrl}`}  
                      alt={postUser.userName}  
                      className="img-fluid rounded-circle me-2"  // Circle-shaped profile image with spacing
                      style={{
                        width: '35px',
                        height: '35px',
                        objectFit: 'cover', 
                      }}
                    />
                  )}
                  <div className="text-truncate" style={{ flex: 1 }}>
                    {/* User name linked to their profile */}
                    <strong>
                      <Link to={`/user/details/${postUser?.id}`} className="text-dark" style={{ textDecoration: 'none' }}>
                        {postUser ? postUser.userName : 'Unknown User'}  {/* Fallback if user is not found */}
                      </Link>
                    </strong>{' '}
                    {/* Post caption displayed in a muted color */}
                    <span className="text-muted">{post.caption}</span>
                  </div>
                </div>

                {/* Display post date */}
                <small className="text-muted">{(new Date(post.postDate)).toLocaleString()}</small>

                {/* Comments Section */}
                <div className="mt-3">
                  {postComments.length > 0 ? (
                    // If there are comments, map through them and display each one
                    <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                      {postComments.map((comment) => {
                        // Find the user who made the comment
                        const commentUser = users.find((user) => user.id === comment.userId);

                        return (
                          <li key={comment.commentId} className="mb-2">
                            <small>
                              <strong>
                                {/* Link to the commenter's profile */}
                                <Link to={`/user/details/${commentUser?.id}`} className="text-dark" style={{ textDecoration: 'none' }}>
                                  {commentUser
                                    ? `${commentUser.userName}`  // Display commenter's username
                                    : 'Unknown User'}
                                </Link>
                              </strong>{' '}
                              {/* Display the comment text */}
                              {comment.commentText}
                              {/* Show the comment date */}
                              <span className="text-muted">
                                {' '}
                                - {(new Date(comment.commentDate)).toLocaleString()}  {/* Display comment date */}
                              </span>
                            </small>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <i>No comments yet</i>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

export default PostGrid;