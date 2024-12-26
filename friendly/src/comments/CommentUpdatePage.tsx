import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom'; 
import { Button, Form, Container, Card } from 'react-bootstrap'; 
import { Comment } from '../types/comment';  // Importing Comment type
import { Post } from '../types/post';  // Importing Post type
import * as CommentService from './CommentService';  // Importing functions from CommentService for comment-related API calls
import * as PostService from '../posts/PostService';  // Importing functions from PostService for post-related API calls

const CommentUpdatePage: React.FC = () => {
    // Extracting commentId from the URL params to fetch the specific comment
    const { commentId } = useParams<{ commentId: string }>(); 
    const navigate = useNavigate();  // Hook for navigating to other routes
    const [comment, setComment] = useState<Comment | null>(null);  // State to store the comment object
    const [post, setPost] = useState<Post | null>(null);  // State to store the associated post object
    const [updatedCommentText, setUpdatedCommentText] = useState<string>('');  // State for holding the text input of the updated comment
    const [error, setError] = useState<string>('');  // State to store error messages if the comment input is invalid

    // useEffect hook to fetch comment and associated post when the component is mounted or commentId changes
    useEffect(() => {
        const fetchCommentAndPost = async () => {
            try {
                if (commentId) {
                    const fetchedComment = await CommentService.fetchCommentById(commentId);
                    setComment(fetchedComment);  // Storing the fetched comment
                    setUpdatedCommentText(fetchedComment.commentText);  // Setting the initial value of the updated comment text

                    // If the comment is associated with a post, fetch the post
                    if (fetchedComment.postId) {
                        const fetchedPost = await PostService.fetchPostById(fetchedComment.postId.toString());
                        setPost(fetchedPost);  // Storing the fetched post
                    }
                }
            } catch (err) {
                console.error('Error fetching comment or post:', err);  // Logging any error that occurs
            }
        };

        fetchCommentAndPost();  // Call the function to fetch comment and post
    }, [commentId]);  // Dependency array ensures the effect runs when commentId changes

    // Function to handle cancel action and navigate back to the previous page
    const onCancel = () => {
        navigate(-1);  // Going back to the previous page in history
    };

    // Function to handle form submission to update the comment
    const handleUpdate = async (e: FormEvent) => {
        e.preventDefault();  // Prevent the default form submission behavior

        // Validation: If comment is empty, show an error
        if (updatedCommentText.trim().length < 1) {
            setError('Comment cannot be empty.');
            return;
        }

        // Validation: If comment exceeds 200 characters, show an error
        if (updatedCommentText.trim().length > 200) {
            setError('Comment must be between 1 and 200 characters.');
            return;
        }

        setError('');  // Reset error if no validation issues

        // Prepare the updated comment object
        const updatedComment = {
            commentText: updatedCommentText,
        };

        try {
            if (comment && comment.commentId) {
                // Call the update function from CommentService to update the comment
                await CommentService.updateComment(comment.commentId, updatedComment);
                console.log('Comment updated successfully!');
                navigate('/posts');  // Navigate to the posts page after the update is successful
            }
        } catch (err) {
            console.error('Error updating comment:', err);  // Log any error during the update process
        }
    };

    return (
        <Container className="mt-5">  {/* Wrapping the entire content inside a Bootstrap Container */}
            <div className="row justify-content-center">  {/* Using Bootstrap grid to center the content */}
                <div className="col-md-6">  {/* The comment form will be inside a column of width 6 (on medium screens) */}
                {/* Only render if both the comment and post are fetched successfully */}
                    {comment && post && (  
                        <Card>  {/* A card element to display the form */}
                            <Card.Body className="text-center">  {/* Card body with centered text */}
                                <h3 className="card-title">Edit Comment</h3>  {/* Heading for the form */}
                                <hr />  {/* Horizontal line to separate sections */}
                                {/* Display post image if available */}
                                {post.postImagePath && (  
                                    <div className="mb-4">
                                        <img
                                            src={`${process.env.REACT_APP_API_BASE_URL}${post.postImagePath}`}  
                                            alt={`${post.caption}`} 
                                            className="img-fluid"  
                                            style={{ maxHeight: '300px', objectFit: 'cover', width: '100%' }}
                                        />
                                    </div>
                                )}
                                {post.caption && <h5>{post.caption}</h5>}  {/* Display post caption if available */}
                                <hr />
                                <Form onSubmit={handleUpdate}>  {/* Form for submitting the updated comment */}
                                    <Form.Group>
                                        <Form.Label>Update your comment</Form.Label>  {/* Label for the textarea */}
                                        <Form.Control
                                            as="textarea"
                                            rows={4}  // Number of rows for the textarea
                                            value={updatedCommentText}  // Controlled input for comment text 
                                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setUpdatedCommentText(e.target.value)}  // Handle text change
                                            placeholder="Enter new comment"  // Placeholder for the textarea
                                            minLength={1}  // Minimum number of characters allowed
                                            maxLength={500}  // Maximum number of characters allowed
                                            required  // Make the field required
                                        />
                                        {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}  {/* Display error message if validation fails */}
                                    </Form.Group>
                                    <hr />
                                    <div className="d-flex justify-content-between">  {/* Flex container for buttons */}
                                        <Button type="submit" variant="primary">Save Changes</Button>  {/* Button to save the changes */}
                                        <Button variant="secondary" onClick={onCancel}>Cancel</Button>  {/* Button to cancel and go back */}
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

export default CommentUpdatePage;  // Export the component