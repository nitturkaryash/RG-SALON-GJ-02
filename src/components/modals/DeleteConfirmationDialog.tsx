import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  itemType?: string;
  isDeleting?: boolean;
}

/**
 * A reusable confirmation dialog for delete operations
 */
const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  message,
  itemName,
  itemType = 'item',
  isDeleting = false,
}) => {
  const defaultMessage = itemName
    ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
    : `Are you sure you want to delete this ${itemType}? This action cannot be undone.`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby='delete-confirmation-dialog-title'
      aria-describedby='delete-confirmation-dialog-description'
    >
      <DialogTitle
        id='delete-confirmation-dialog-title'
        sx={{ color: 'error.main' }}
      >
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id='delete-confirmation-dialog-description'>
          {message || defaultMessage}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          color='error'
          variant='contained'
          startIcon={
            isDeleting ? (
              <CircularProgress size={20} color='inherit' />
            ) : (
              <DeleteIcon />
            )
          }
          disabled={isDeleting}
          sx={{
            '&:hover': {
              backgroundColor: 'error.dark',
            },
          }}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
