import React, { useState, useEffect } from 'react';
import { Button, Container } from 'react-bootstrap';
import PostTable from './PostTable';
import PostGrid from './PostGrid';
import { Link } from 'react-router-dom';
import { Post } from '../types/post'; 
import { Comment } from '../types/comment'; 
import { User } from '../types/user'; 
import { Like } from '../types/like'; 
import * as PostService from './PostService'; 
import * as UserService from '../users/UserService';  
import * as CommentService from '../comments/CommentService';  

const PostDisplayPage: React.FC = () =>  {
    // State variables to manage the posts, users, comments, likes, and loading/error states.
    const [posts, setPosts] = useState<Post[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [likes, setLikes] = useState<{ [postId: number]: number}>([]);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [allLikes, setAllLikes] = useState<Like[]>([]);

    // Function to fetch posts, users, and comments, along with likes for each post.
    const fetchPostsUsersAndComments = async () => {
        setLoading(true);  // Set loading state to true while fetching data
        setError(null);  // Reset any previous errors

        try {
            // Fetch posts, users, and comments using service functions
            const [postsResponse, usersResponse, commentsResponse] = await Promise.all([
                PostService.fetchPosts(),
                UserService.fetchUsers(),
                CommentService.fetchComments(),
            ]);

            // Fallback to empty arrays if the API responses are empty or null
            const posts = postsResponse || [];
            const users = usersResponse || [];
            const comments = commentsResponse || [];

            // Fetch likes for each post in parallel
            const likesPromises = posts.map(post => {
                return PostService.fetchLikesByPostId(post.postId.toString())  // Ensure postId is a string
                    .catch(err => {
                        console.error(`Failed to fetch likes for postId ${post.postId}:`, err.message);
                        return [];  // Return an empty array if the like fetch fails
                    });
            });

            // Wait for all the like fetch promises to resolve
            const likesResponse = await Promise.all(likesPromises);

            // Flatten the array of likes data
            const allLikes = likesResponse.flat();

            setAllLikes(allLikes); // Update the allLikes state with the fetched likes

            // Count the number of likes for each post by aggregating the data
            const likesCount: { [postId: number]: number } = allLikes.reduce((acc, curr) => {
                if (curr && curr.postId) { // Ensure the like data and postId exist
                    acc[curr.postId] = (acc[curr.postId] || 0) + 1;
                }
                return acc;
            }, {});

            console.log('allLikes', allLikes);

            // Update states with fetched data
            setPosts(posts);
            setUsers(users);
            setComments(comments);
            setLikes(likesCount);
        } catch (err) {
            console.error('Error fetching data:', err.message);
            setError('Failed to fetch data. Please try again later.');
        } finally {
            setLoading(false);  // Set loading to false once the fetching process is completed
        }
    };

    // useEffect hook to trigger the data fetching on component mount
    useEffect(() => {
        fetchPostsUsersAndComments();
    }, []);  // Empty dependency array to ensure it runs only once when the component is mounted

    // Function to handle submitting a like for a post
    const handleSubmitLike = async (postId: number) => {
        console.log('handleSubmitLike postId', postId);
        try {
            // Find the user with the username 'baifanz' (for demo purposes)
            const user = users.find(user => user.userName === 'baifanz');
            if (!user) {
                throw new Error('User with username baifanz not found');
            }

            // Create like data with the postId and userId
            const likeData = {
                postId: postId,
                userId: user.id,
            };

            // Use the PostService to create a like for the post
            await PostService.createLike(likeData);

            // Update likes state by incrementing the like count for the post
            setLikes(prevLikes => ({
                ...prevLikes,
                [postId]: (prevLikes[postId] || 0) + 1,
            }));

            console.log('Like created for postId ' + postId);

        } catch (error) {
            console.error('Error submitting like:', error);
        }

        // Fetch posts, users, comments, and likes again after submitting the like
        fetchPostsUsersAndComments();
    };

    // Function to handle unliking a post (removing the like)
    const handleUnlike = async (postId: number) => {
        console.log('handleUnlike postId', postId);
        try {
            // Find the user with the username 'baifanz'
            const user = users.find(user => user.userName === 'baifanz');
            if (!user) {
                throw new Error('User with username baifanz not found');
            }

            // Create unlike data
            const unlikeData = {
                postId: postId,
                userId: user.id,
            };

            // Use PostService to delete the like for the post
            await PostService.deleteLike(unlikeData);

            // Update likes state by decrementing the like count for the post
            setLikes(prevLikes => ({
                ...prevLikes,
                [postId]: (prevLikes[postId] || 0) - 1,
            }));
            console.log('Like deleted for postId ' + postId);

        } catch (error) {
            console.error('Error deleting like:', error);
        }

        // Fetch posts, users, comments, and likes again after deleting the like
        fetchPostsUsersAndComments();
    };

    // Function to handle submitting a comment for a post
    const handleSubmitComment = async (postId: number, commentText: string) => {
        try {
            // Find the user with the username 'baifanz'
            const user = users.find(user => user.userName === 'baifanz');
            if (!user) {
                throw new Error('User with username baifanz not found');
            }

            // Prepare comment data to send
            const commentData = {
                commentText: commentText,
                commentDate: new Date().toISOString(),  // Get the current timestamp
                postId: postId,
                userId: user.id,
            };

            // Create the comment using CommentService
            const data = await CommentService.createComment(commentData);

            // Update comments state to include the newly created comment
            setComments(prevComments => [...prevComments, data]);

        } catch (error) {
            console.error('Error submitting comment:', error);
        }
    };

    // Function to handle deleting a comment
    const handleDeleteComment = async (commentId: number) => {
        try {
            // Use CommentService to delete the comment by ID
            await CommentService.deleteComment(commentId);

            // Update comments state to remove the deleted comment
            setComments((prevComments) =>
                prevComments.filter((comment) => comment.commentId !== commentId)
            );
        } catch (err) {
            console.error('Error deleting comment:', err);
        }
    };

    // Conditional rendering based on loading or error state
    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <Container>
            <h1 className="my-4">Posts</h1>
            {/* Link to create a new post */}
            <Link to="/postcreate" className="btn btn-secondary mt-1">Create New Post</Link>
            <div className="d-flex justify-content-between mb-1"></div>

            {/* Buttons to switch between table view and grid view */}
            <div className="mb-2">
                <Button
                    variant={viewMode === 'table' ? 'primary' : 'secondary'}
                    onClick={() => setViewMode('table')}
                    style={{ marginRight: '5px' }}
                >
                    Table View
                </Button>
                <Button
                    variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                    onClick={() => setViewMode('grid')}
                >
                    Grid View
                </Button>
            </div>

            {/* Conditionally render either PostTable or PostGrid based on the selected view mode */}
            {viewMode === 'table' ? (
                <PostTable
                    posts={posts}
                    users={users}
                    comments={comments}
                    likes={likes}
                    allLikes={allLikes}
                    handleSubmitLike={handleSubmitLike}
                    handleSubmitComment={handleSubmitComment}
                    handleDeleteComment={handleDeleteComment}
                    handleUnlike={handleUnlike}
                />
            ) : (
                <PostGrid 
                    posts={posts} 
                    users={users}
                    comments={comments} 
                />
            )}
        </Container>
    );
};

export default PostDisplayPage;