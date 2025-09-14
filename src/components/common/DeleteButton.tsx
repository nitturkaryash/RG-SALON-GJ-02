import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

interface DeleteButtonProps {
  onDelete: () => Promise<void> | void;
  itemName?: string;
  itemType?: string;
  tooltipText?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning';
  confirmationMessage?: string;
}

/**
 * A reusable delete button with confirmation dialog
 */
const DeleteButton: React.FC<DeleteButtonProps> = ({
  onDelete,
  itemName,
  itemType = 'item',
  tooltipText = 'Delete',
  icon = <DeleteIcon />,
  disabled = false,
  size = 'small',
  color = 'error',
  confirmationMessage,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenDialog = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click when button is clicked
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete();
    } catch (error) {
      console.error('Error during deletion:', error);
    } finally {
      setIsDeleting(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <Tooltip title={tooltipText}>
        <span>
          <IconButton
            size={size}
            color={color}
            disabled={disabled}
            onClick={handleOpenDialog}
            aria-label={`delete-${itemType}`}
            sx={{
              transition: 'all 0.2s',
              '&:hover': {
                color: 'error.main',
              },
            }}
          >
            {icon}
          </IconButton>
        </span>
      </Tooltip>

      <DeleteConfirmationDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
        itemName={itemName}
        itemType={itemType}
        isDeleting={isDeleting}
        message={confirmationMessage}
      />
    </>
  );
};

export default DeleteButton;
