import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
} from '@mui/material';
import { Edit, Delete, PersonAdd } from '@mui/icons-material';
import { supabase } from '../utils/supabase/supabaseClient.js';
import { toast } from 'react-toastify';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'stylist' | 'user';
  avatar_url?: string;
  created_at: string;
  last_sign_in_at?: string;
  provider: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Get users from Supabase auth
      const { data: authUsers, error } = await supabase.auth.admin.listUsers();
      
      if (error) throw error;

      // Transform auth users to our User interface
      const transformedUsers: User[] = authUsers.users.map(user => ({
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || user.email || '',
        role: user.user_metadata?.role || 'user',
        avatar_url: user.user_metadata?.avatar_url,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        provider: user.app_metadata?.provider || 'email'
      }));

      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      // Update user metadata in Supabase
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { role: newRole }
      });

      if (error) throw error;

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole as any } : user
      ));

      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;

      setUsers(users.filter(user => user.id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'stylist': return 'info';
      default: return 'default';
    }
  };

  const EditUserDialog = () => (
    <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User Role</DialogTitle>
      <DialogContent>
        {editUser && (
          <Box sx={{ pt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar src={editUser.avatar_url} sx={{ mr: 2 }}>
                {editUser.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6">{editUser.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {editUser.email}
                </Typography>
              </Box>
            </Box>
            
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={editUser.role}
                label="Role"
                onChange={(e) => setEditUser({ ...editUser, role: e.target.value as any })}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="stylist">Stylist</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
        <Button 
          onClick={() => {
            if (editUser) {
              updateUserRole(editUser.id, editUser.role);
              setEditDialogOpen(false);
            }
          }}
          variant="contained"
        >
          Update Role
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (loading) {
    return <Typography>Loading users...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">User Management</Typography>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => toast.info('Users can sign up via Google OAuth on the login page')}
        >
          Add User Instructions
        </Button>
      </Box>

      <Grid container spacing={2}>
        {users.map((user) => (
          <Grid item xs={12} md={6} lg={4} key={user.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar src={user.avatar_url} sx={{ mr: 2 }}>
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" noWrap>{user.name}</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {user.email}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton 
                      size="small" 
                      onClick={() => {
                        setEditUser(user);
                        setEditDialogOpen(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => deleteUser(user.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip 
                    label={user.role.toUpperCase()} 
                    color={getRoleColor(user.role)}
                    size="small"
                  />
                  <Chip 
                    label={user.provider} 
                    variant="outlined"
                    size="small"
                  />
                </Box>
                
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Joined: {new Date(user.created_at).toLocaleDateString()}
                </Typography>
                {user.last_sign_in_at && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Last active: {new Date(user.last_sign_in_at).toLocaleDateString()}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <EditUserDialog />
    </Box>
  );
};

export default UserManagement; 