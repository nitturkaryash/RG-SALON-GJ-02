import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from '../Router';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '../styles/theme';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Toaster } from 'react-hot-toast';
import { StrictMode } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import { StylistHolidaysProvider } from '../contexts/StylistHolidaysProvider';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addClientColumns } from '../utils/addClientColumns';

export default function LegacyAppIndex() {
	useEffect(() => {
		addClientColumns().catch(err => {
			console.error('Error running addClientColumns:', err);
		});
	}, []);

	return (
		<StrictMode>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<LocalizationProvider dateAdapter={AdapterDateFns}>
					<ErrorBoundary>
						<StylistHolidaysProvider>
							<BrowserRouter>
								<ToastContainer
									position="top-right"
									autoClose={3000}
									hideProgressBar={false}
									newestOnTop
									closeOnClick
									rtl={false}
									pauseOnFocusLoss
									draggable
									pauseOnHover
								/>
								<Toaster position="top-right" />
								<AppRouter />
							</BrowserRouter>
						</StylistHolidaysProvider>
					</ErrorBoundary>
				</LocalizationProvider>
			</ThemeProvider>
		</StrictMode>
	);
}


