import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { useClients, Client } from '../hooks/useClients';
import { isValidPhoneNumber, isValidEmail } from '../utils/validation';
import { toast } from 'react-toastify';
import { ExcelClient, ImportResult } from '../types/excel';

interface ClientExcelImportProps {
  open: boolean;
  onClose: () => void;
}

export default function ClientExcelImport({ open, onClose }: ClientExcelImportProps) {
  const { createClientAsync } = useClients();
  const [file, setFile] = useState<File | null>(null);
  const [parsedClients, setParsedClients] = useState<ExcelClient[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [progress, setProgress] = useState(0);

  // Reset state when dialog opens/closes
  const handleClose = useCallback(() => {
    setFile(null);
    setParsedClients([]);
    setImportResults([]);
    setShowResults(false);
    setShowErrors(false);
    setProgress(0);
    setImporting(false);
    onClose();
  }, [onClose]);

  // Handle file selection
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.xlsx') && !selectedFile.name.toLowerCase().endsWith('.xls')) {
      toast.error('Please select an Excel file (.xlsx or .xls)');
      return;
    }

    setFile(selectedFile);
    parseExcelFile(selectedFile);
  }, []);

  // Parse Excel file
  const parseExcelFile = useCallback((file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error('Failed to read file');

        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Try to find the correct sheet (look for 'SURAT' first, then first sheet)
        let sheetName = 'SURAT';
        if (!workbook.SheetNames.includes('SURAT')) {
          sheetName = workbook.SheetNames[0];
        }

        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        // Skip header row and filter out empty rows
        const dataRows = jsonData.slice(1).filter(row => row[0] && row[1]);

        // Map Excel data to client structure
        const clients: ExcelClient[] = dataRows.map(row => ({
          full_name: (row[0] || '').toString().trim(),
          phone: (row[1] || '').toString().trim(),
          email: row[2] ? row[2].toString().trim() : undefined,
          gender: row[3] ? row[3].toString().toLowerCase().trim() : undefined,
          notes: `Imported from Excel on ${new Date().toLocaleDateString()}`,
          birth_date: undefined, // Can be extended later
          anniversary_date: undefined // Can be extended later
        }));

        // Validate and filter clients
        const validClients = clients.filter(client => {
          if (!client.full_name || !client.phone) return false;
          if (client.email && !isValidEmail(client.email)) {
            client.email = undefined; // Clear invalid email but keep client
          }
          return true;
        });

        setParsedClients(validClients);
        toast.success(`Parsed ${validClients.length} valid clients from Excel file`);

      } catch (error) {
        console.error('Error parsing Excel file:', error);
        toast.error('Failed to parse Excel file. Please check the format.');
      }
    };

    reader.readAsBinaryString(file);
  }, []);

  // Import clients to database
  const handleImport = useCallback(async () => {
    if (parsedClients.length === 0) return;

    setImporting(true);
    setProgress(0);
    const results: ImportResult[] = [];
    const batchSize = 10; // Process in small batches to avoid overwhelming the API

    try {
      for (let i = 0; i < parsedClients.length; i += batchSize) {
        const batch = parsedClients.slice(i, i + batchSize);
        
        // Process batch in parallel
        const batchPromises = batch.map(async (client) => {
          try {
            await createClientAsync({
              full_name: client.full_name,
              phone: client.phone,
              email: client.email || '',
              gender: client.gender || '',
              notes: client.notes || '',
              birth_date: client.birth_date || null,
              anniversary_date: client.anniversary_date || null
            });
            
            return { success: true, client };
          } catch (error) {
            return { 
              success: false, 
              client, 
              error: error instanceof Error ? error.message : 'Unknown error' 
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Update progress
        const completed = Math.min(i + batchSize, parsedClients.length);
        setProgress((completed / parsedClients.length) * 100);

        // Small delay between batches to prevent overwhelming the database
        if (i + batchSize < parsedClients.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      setImportResults(results);
      setShowResults(true);

      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;

      if (errorCount === 0) {
        toast.success(`Successfully imported all ${successCount} clients!`);
      } else {
        toast.warning(`Imported ${successCount} clients. ${errorCount} failed.`);
      }

    } catch (error) {
      console.error('Import error:', error);
      toast.error('Import process failed. Please try again.');
    } finally {
      setImporting(false);
    }
  }, [parsedClients, createClientAsync]);

  // Download template Excel file
  const downloadTemplate = useCallback(() => {
    const templateData = [
      ['Client Name', 'Phone Number', 'Email (Optional)', 'Gender (Optional)'],
      ['John Doe', '9876543210', 'john@example.com', 'male'],
      ['Jane Smith', '9876543211', 'jane@example.com', 'female'],
      ['Sample Client', '9876543212', '', '']
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SURAT');
    XLSX.writeFile(wb, 'Client_Import_Template.xlsx');
    
    toast.success('Template downloaded successfully!');
  }, []);

  const successfulImports = importResults.filter(r => r.success);
  const failedImports = importResults.filter(r => !r.success);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Import Clients from Excel</Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={downloadTemplate}
          >
            Download Template
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        {!showResults ? (
          <Box>
            {/* File Upload Section */}
            <Box mb={3}>
              <input
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
                id="excel-file-input"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="excel-file-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  sx={{ py: 2 }}
                >
                  {file ? `Selected: ${file.name}` : 'Select Excel File'}
                </Button>
              </label>
            </Box>

            {/* File Format Instructions */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Excel Format Requirements:</strong>
              </Typography>
              <Typography variant="body2" component="div">
                • Column A: Client Name (Required)
                <br />
                • Column B: Phone Number (Required)
                <br />
                • Column C: Email (Optional)
                <br />
                • Column D: Gender (Optional)
                <br />
                • First row should be headers
                <br />
                • Sheet should be named "SURAT" or will use first sheet
              </Typography>
            </Alert>

            {/* Preview Parsed Data */}
            {parsedClients.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Preview ({parsedClients.length} clients found)
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 300, mb: 2 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Gender</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {parsedClients.slice(0, 10).map((client, index) => (
                        <TableRow key={index}>
                          <TableCell>{client.full_name}</TableCell>
                          <TableCell>{client.phone}</TableCell>
                          <TableCell>{client.email || '-'}</TableCell>
                          <TableCell>{client.gender || '-'}</TableCell>
                        </TableRow>
                      ))}
                      {parsedClients.length > 10 && (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            <Typography variant="body2" color="text.secondary">
                              ... and {parsedClients.length - 10} more clients
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Import Progress */}
            {importing && (
              <Box>
                <Typography variant="body1" gutterBottom>
                  Importing clients... ({Math.round(progress)}% complete)
                </Typography>
                <LinearProgress variant="determinate" value={progress} sx={{ mb: 2 }} />
              </Box>
            )}
          </Box>
        ) : (
          /* Import Results */
          <Box>
            <Alert 
              severity={failedImports.length === 0 ? "success" : "warning"} 
              sx={{ mb: 3 }}
            >
              <Typography variant="body1">
                Import completed: {successfulImports.length} successful, {failedImports.length} failed
              </Typography>
            </Alert>

            {/* Success Summary */}
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Chip
                icon={<CheckCircleIcon />}
                label={`${successfulImports.length} Successful`}
                color="success"
                variant="outlined"
              />
              {failedImports.length > 0 && (
                <Chip
                  icon={<ErrorIcon />}
                  label={`${failedImports.length} Failed`}
                  color="error"
                  variant="outlined"
                  onClick={() => setShowErrors(!showErrors)}
                  clickable
                />
              )}
            </Box>

            {/* Failed Imports Details */}
            {failedImports.length > 0 && (
              <Box>
                <Button
                  onClick={() => setShowErrors(!showErrors)}
                  startIcon={showErrors ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  sx={{ mb: 1 }}
                >
                  {showErrors ? 'Hide' : 'Show'} Error Details
                </Button>
                
                <Collapse in={showErrors}>
                  <Paper sx={{ p: 2, bgcolor: 'error.light', mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Failed Imports:
                    </Typography>
                    <List dense>
                      {failedImports.map((result, index) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemText
                              primary={result.client.full_name}
                              secondary={`${result.client.phone} - ${result.error}`}
                            />
                          </ListItem>
                          {index < failedImports.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Paper>
                </Collapse>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          {showResults ? 'Close' : 'Cancel'}
        </Button>
        {!showResults && parsedClients.length > 0 && (
          <Button
            onClick={handleImport}
            variant="contained"
            disabled={importing || parsedClients.length === 0}
            startIcon={<CloudUploadIcon />}
          >
            {importing ? 'Importing...' : `Import ${parsedClients.length} Clients`}
          </Button>
        )}
        {showResults && (
          <Button
            onClick={() => {
              setShowResults(false);
              setFile(null);
              setParsedClients([]);
              setImportResults([]);
            }}
            variant="outlined"
          >
            Import Another File
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
} 