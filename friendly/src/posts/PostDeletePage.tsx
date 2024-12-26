import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Container, Row, Col, Card } from 'react-bootstrap';
import { Post } from '../types/post'; 
import * as PostService from './PostService';

const API_URL = 'http://localhost:5062';

const PostDeletePage: React.FC = () => {
  // Get the postId from the URL
  const { postId } = useParams<{ postId: string }>();  // The postId is a string
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);  // State for the post, initially null

  useEffect(() => {
    if (!postId) return;

    // Fetch the post data by postId using the PostService
    PostService.fetchPostById(postId)
      .then(fetchedPost => {
        setPost(fetchedPost);
      })
      .catch(err => {
        console.error('Error fetching post:', err);
      });
  }, [postId]);

  // Handle cancel action (navigate back)
  const onCancel = () => {
    navigate(-1); // Navigate back one step in the history
  };

  // Handle the delete action
  const handleDelete = async () => {
    if (!postId) return;

    try {
      // Delete the post using the PostService
      await PostService.deletePost(parseInt(postId)); // Ensure postId is a number
      navigate('/posts');  // Redirect to /posts (PostListPage) after successful deletion
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="card-title text-danger">Are you sure you want to delete this post?</h3>
              <p className="text-muted">This action cannot be undone.</p>
              <hr />

              {post && (
                <>
                  {/* Post Image */}
                  <div className="mb-4">
                    <img
                      src={`${API_URL}${post.postImagePath}`}
                      alt={post.caption}
                      className="img-fluid"
                      style={{ maxHeight: '300px', objectFit: 'cover', width: '100%' }}
                    />
                  </div>

                  {/* Post Caption */}
                  <p className="card-text"><strong>{post.caption}</strong></p>

                  {/* Post Date */}
                  <p className="text-muted">
                    <small>{new Date(post.postDate).toLocaleString()}</small>
                  </p>
                  <hr />

                  {/* Delete Confirmation */}
                  <div className="d-flex justify-content-between">
                    <Button variant="danger" onClick={handleDelete}>Delete</Button>
                    <Button variant="secondary" onClick={onCancel} className="ms-2">Cancel</Button>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PostDeletePage;