import React, { useState, useEffect, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types/user';
import * as UserService from './UserService';

const API_URL = 'http://localhost:5062';

const UserListPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]); // All users fetched from the API
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]); // Users filtered based on search term
    const [loading, setLoading] = useState<boolean>(false); // Track loading state while fetching data
    const [error, setError] = useState<string | null>(null); // To track and display error messages
    const [searchTerm, setSearchTerm] = useState<string>(''); // The term used in the search bar

    const fetchUsers = async () => {
        setLoading(true); // Set loading state to true while fetching
        setError(null); // Reset error state before fetching data

        try {
            const data = await UserService.fetchUsers(); // Use the service's `fetchUsers` method
            setUsers(data);
            setFilteredUsers(data);
        } catch (error: unknown) {
            console.error(`There was a problem with fetching users: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setError('Failed to fetch users. Please try again later.');
        } finally {
            setLoading(false); // Set loading to false when the fetch operation is complete
        }
    };

    // `useEffect` hook to fetch users once when the component is mounted
    useEffect(() => {
        fetchUsers();
    }, []);

    // `useEffect` hook to filter users based on the search term whenever searchTerm or users change
    useEffect(() => {
        if (searchTerm === '') {
            setFilteredUsers(users); // Reset to show all users
        } else {
            // Filter users based on the search term, checking for matches in userName, firstName, lastName, or email
            const filtered = users.filter(user =>
                user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredUsers(filtered); // Set filtered users based on the search term
        }
    }, [searchTerm, users]); // Re-run this effect if either searchTerm or users changes

    // Handle search input changes and update the searchTerm state
    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value); // Update searchTerm state with the new value from the input field
    };

    // If loading, show loading message
    if (loading) {
        return <p>Loading...</p>;
    }

    // If an error occurred during fetch, display the error message
    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <div className="container">
            <h1 className="my-4">Users</h1>
            
            {/* Search Bar */}
            <input
                type="text"
                className="form-control mb-4"
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearchChange} // Update searchTerm as user types
            />
            
            {/* User List Table */}
            <table className='table table-striped'>
                <thead>
                    <tr>
                        {/* Column headers */}
                        <th>Profile Image</th>
                        <th>Username</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone Number</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Map over filteredUsers and display each user's data */}
                    {filteredUsers.map(user => (
                        <tr key={user.id}>
                            {/* Display user's profile image */}
                            <td>
                                <img
                                    src={`${API_URL}${user.profileImageUrl}`}
                                    alt={user.userName}
                                    className="img-fluid rounded-circle mb-3"
                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                />
                            </td>
                            {/* Display clickable username linked to user's details page */}
                            <td>
                                <strong>
                                    <Link to={`/user/details/${user.id}`} className="text-dark" style={{ textDecoration: 'none' }}>
                                        {user.userName}
                                    </Link>
                                </strong>
                            </td>
                            {/* Display full name or 'Unknown' if firstName/lastName is missing */}
                            <td>
                                {user.firstName || user.lastName
                                    ? `${user.firstName || ''} ${user.lastName || ''}`
                                    : <i>Unknown</i>}
                            </td>
                            {/* Display email */}
                            <td>{user.email}</td>
                            {/* Display phone number or 'Missing' if no phone number */}
                            <td>{user.phoneNumber || <i>Missing</i>}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserListPage;