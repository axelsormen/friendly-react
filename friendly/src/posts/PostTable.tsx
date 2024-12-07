import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Row, Col, Card, Button, Container, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Post } from '../types/post'; 
import { Comment } from '../types/comment'; 
import { User } from '../types/user'; 
import { Like } from '../types/like'; 

const API_URL = 'http://localhost:5062';

interface PostTableProps {
    posts: Post[];
    users: User[];
    comments: Comment[];
    likes: { [postId: number]: number};
    allLikes: Like[];
    handleSubmitLike: (postId: number) => Promise<void>;
    handleUnlike: (postId: number) => Promise<void>;
    handleSubmitComment: (postId: number, commentText: string) => Promise<void>;
    handleDeleteComment: (commentId: number) => Promise<void>;
}

const PostTable: React.FC<PostTableProps> = ({
    posts,
    users,
    comments,
    allLikes,
    handleSubmitLike,
    handleUnlike,
    handleSubmitComment,
    handleDeleteComment,
}) => {

    const [commentTexts, setCommentTexts] = useState<{ [key: number]: string }>({});
    const [isLiked, setIsLiked] = useState<{ [key: number]: boolean }>({});
    const navigate = useNavigate();

    // Handle comment input changes for each post
    const handleCommentChange = (event: ChangeEvent<HTMLTextAreaElement>, postId: number) => {
        setCommentTexts((prev) => ({
            ...prev,
            [postId]: event.target.value, // event.target will be a textarea
        }));
    };

    const handleCommentSubmit = async (event: FormEvent, postId: number) => {
        event.preventDefault();

        const newCommentText = commentTexts[postId];

        // Check if the comment text is empty
        if (!newCommentText || newCommentText.trim() === '') {
            alert('Comment cannot be empty!');
            return; // Prevent submission if comment is empty
        }

        try {
            await handleSubmitComment(postId, newCommentText); // Send comment to API
            setCommentTexts((prev) => ({
                ...prev,
                [postId]: '', // Reset the input field after submission for the specific post
            }));
        } catch (error) {
            console.error('Error submitting comment:', error);
        }
    };

    const handleDeleteCmt = async (commentId: number) => {
        await handleDeleteComment(commentId); // Call the function passed as prop
    };

    const handleUpdateCmt = async (commentId: number) => {
        navigate(`/commentupdate/${commentId}`); // Correct path with commentId
    };

    const handleDeletePost = async (postId: number) => {
        navigate(`/postdelete/${postId}`); // Correct path with postId
    };

    const handleUpdate = async (postId: number) => {
        navigate(`/postupdate/${postId}`); // Correct path with postId
    };

    const handleLikeUnlike = async (postId: number) => {
        if (isLiked[postId]) {
            // If already liked, call the unlike function to remove the like
            await handleUnlike(postId);

            // Update the isLiked state to mark the post as unliked (set to false)
            setIsLiked((prev) => ({ ...prev, [postId]: false }));
        } else {
            // If not liked, call the submit like function to add a like to the post
            await handleSubmitLike(postId);

            // Update the isLiked state to mark the post as liked (set to true)
            setIsLiked((prev) => ({ ...prev, [postId]: true }));
        }
    };

    return (
        <Container>
            {posts.map((post) => {
                const postUser = users.find((userItem) => userItem.id === post.userId);
                const isBaifanzPost = postUser && postUser.userName === 'baifanz';
                const postComments = comments.filter((comment) => comment.postId === post.postId);
                const likesForThisPost = allLikes[post.postId - 1];

                return (
                    <Row key={post.postId} className="mb-5" style={{ backgroundColor: '#f7f7f7' }}>
                        <Col md={6}>
                            <Card>
                                <Card.Body>
                                    {/* Post content */}
                                    <img
                                        src={`${API_URL}${post.postImagePath}`}
                                        alt="Post"
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <div className="my-2">
                                        <div className="d-flex justify-content-start gap-1">
                                            <span>{typeof likesForThisPost === 'number' ? likesForThisPost : 'Error'} Likes</span>
                                            {/* Like/unlike buttons */}
                                            <Button
                                                variant={isLiked[post.postId] ? 'secondary' : 'primary'}
                                                size="sm"
                                                onClick={() => handleLikeUnlike(post.postId)}>
                                                {isLiked[post.postId] ? 'Unlike' : 'Like'}
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => handleUnlike(post.postId)}>
                                                Unlike
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Profile image, username, and caption on the same line */}
                                    <div className="d-flex align-items-center my-2">
                                        {postUser && (
                                            <img
                                                src={`${API_URL}${postUser.profileImageUrl}`}
                                                alt={postUser.userName}
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '50%',
                                                    marginRight: '10px',
                                                }}
                                            />
                                        )}
                                        <strong>
                                            <Link to={`/user/details/${postUser.id}`} className="text-dark" style={{ textDecoration: 'none' }}>
                                                {postUser ? `${postUser.userName}` : 'Unknown User'}
                                            </Link>
                                        </strong>
                                        <p className="ms-3 mb-0">{post.caption}</p>
                                    </div>

                                    <div>
                                        <small>{post.postDate.toLocaleString()}</small>
                                    </div>
                                    <div className="d-flex justify-content-start gap-2">
                                        {/* Update post button for 'baifanz' */}
                                        {isBaifanzPost && (
                                            <Button variant="primary" size="sm" onClick={() => handleUpdate(post.postId)}>
                                                Update
                                            </Button>
                                        )}
                                        {/* Delete post button for 'baifanz' */}
                                        {isBaifanzPost && (
                                            <Button variant="danger" size="sm" onClick={() => handleDeletePost(post.postId)}>
                                                Delete
                                            </Button>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Comments section */}
                        <Col md={6}>
                            <div>
                                {postComments.length > 0 ? (
                                    <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                                        {postComments.map((comment) => {
                                            const commentUser = users.find((userItem) => userItem.id === comment.userId);
                                            const isBaifanzComment = commentUser && commentUser.userName === 'baifanz';

                                            return (
                                                <li key={comment.commentId} className="mb-2">
                                                    <div className="d-flex align-items-center">
                                                        {commentUser && (
                                                            <img
                                                                src={`${API_URL}${commentUser.profileImageUrl}`}
                                                                alt={commentUser.userName}
                                                                style={{
                                                                    width: '30px',
                                                                    height: '30px',
                                                                    borderRadius: '50%',
                                                                    marginRight: '10px',
                                                                }}
                                                            />
                                                        )}
                                                        <strong>
                                                            <Link to={`/user/details/${commentUser.id}`} className="text-dark" style={{ textDecoration: 'none' }}>
                                                                {commentUser ? `${commentUser.userName}` : 'Unknown User'}
                                                            </Link>
                                                        </strong>
                                                        <span className="ms-2">{comment.commentText}</span>
                                                        <small className="ms-2 text-muted">({comment.commentDate.toLocaleString()})</small>

                                                        {/* Edit and Delete comment buttons for 'baifanz' */}
                                                        {isBaifanzComment && (
                                                            <Button variant="primary" size="sm" onClick={() => handleUpdateCmt(comment.commentId)} className="ms-2">
                                                                Edit
                                                            </Button>
                                                        )}
                                                        {isBaifanzComment && (
                                                            <Button variant="danger" size="sm" onClick={() => handleDeleteCmt(comment.commentId)} className="ms-2">
                                                                Delete
                                                            </Button>
                                                        )}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : (
                                    <i>No comments yet</i>
                                )}
                            </div>

                            {/* Comment submission form */}
                            <div className="mt-3">
                                <Form onSubmit={(e) => handleCommentSubmit(e, post.postId)}>
                                    <Form.Group>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={commentTexts[post.postId] || ''} // Access the specific postId's text
                                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleCommentChange(e, post.postId)} // Explicitly type the event as HTMLTextAreaElement
                                            placeholder="Write a comment..."
                                        />
                                    </Form.Group>
                                    <div className="d-flex justify-content-end mt-2">
                                        <Button type="submit" variant="secondary" size="sm">
                                            Post Comment
                                        </Button>
                                    </div>
                                </Form>
                            </div>
                        </Col>
                    </Row>
                );
            })}
        </Container>
    );
};

export default PostTable;