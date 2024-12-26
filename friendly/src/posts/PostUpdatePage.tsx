import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Form, Container, Card } from 'react-bootstrap';
import * as PostService from './PostService';  // Import PostService
import { Post } from '../types/post'; 

const API_URL = 'http://localhost:5062';

const PostUpdatePage: React.FC = () => {
    const { postId } = useParams<{ postId: string }>();  // Specify the type for postId
    const navigate = useNavigate();
    const [post, setPost] = useState<Post | null>(null);  // State for storing the post data
    const [caption, setCaption] = useState<string>('');  // State for the caption text
    const [error, setError] = useState<string>('');  // Error state for validation

    useEffect(() => {
        if (!postId) return;

        // Fetch the post data by postId using PostService
        const fetchPost = async () => {
            try {
                const fetchedPost = await PostService.fetchPostById(postId);
                console.log('Fetched Post:', fetchedPost);  // Log the fetched post to debug
                setPost(fetchedPost);
                setCaption(fetchedPost.caption);  // Set the initial caption value
            } catch (err) {
                console.error('Error fetching post:', err);
            }
        };

        fetchPost();
    }, [postId]);

    const onCancel = () => {
        navigate(-1); // Navigate back one step in the history
    };

    const handleUpdate = async (e: FormEvent) => {
        e.preventDefault();

        // Validate caption length (1-200 characters)
        if (caption.length < 1 || caption.length > 200) {
            setError('Caption must be between 1 and 200 characters.');
            return;  // Prevent form submission if invalid
        }

        setError(''); // Clear any previous errors

        const updatedPost = {
            caption,  // Only send the updated caption
        };

        try {
            // Update the post using PostService
            await PostService.updatePost(Number(postId), updatedPost);

            // Redirect to /posts after successful update
            navigate('/posts');  // Redirect to PostListPage ("/posts")
        } catch (error) {
            console.error('Error updating post:', error);
        }
    };

    return (
        <Container className="mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    {post && (
                        <Card>
                            <Card.Body className="text-center">
                                <h3 className="card-title">Edit Caption</h3>
                                <hr />

                                {/* Display the post image */}
                                <div className="mb-4">
                                    <img
                                        src={`${API_URL}${post.postImagePath}`}
                                        alt={`${post.caption}`}
                                        className="img-fluid"
                                        style={{ maxHeight: '300px', objectFit: 'cover', width: '100%' }}
                                    />
                                </div>

                                {/* Edit caption form */}
                                <Form onSubmit={handleUpdate}>
                                    <Form.Group>
                                        <Form.Label>Update your caption</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={caption}
                                            onChange={(e) => setCaption(e.target.value)} // Update caption state
                                            placeholder="Enter new caption"
                                            minLength={1}
                                            maxLength={200}
                                            required
                                        />
                                        {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
                                    </Form.Group>

                                    <hr />

                                    {/* Buttons for form submission and cancellation */}
                                    <div className="d-flex justify-content-between">
                                        <Button type="submit" variant="primary">Save Changes</Button>
                                        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    )}
                </div>
            </div>
        </Container>
    );
};

export default PostUpdatePage;