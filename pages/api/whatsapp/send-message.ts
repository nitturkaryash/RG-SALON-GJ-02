import { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { recipient, message } = req.body;

    if (!recipient || !message) {
      return res.status(400).json({ error: 'Recipient and message are required' });
    }

    // Construct the path to the Python script
    // Assuming the script is in src/whatsapp/open-source/services/whatsapp_service_selenium.py
    // Adjust the path if your project structure is different.
    const scriptDir = path.resolve(process.cwd(), 'src/whatsapp/open-source/services');
    const pythonScriptPath = path.join(scriptDir, 'whatsapp_service_selenium.py');
    
    // It's good practice to also specify the python interpreter explicitly
    // This could be 'python' or 'python3' or a path to a virtual environment python
    // For now, let's assume 'python3' is in the system PATH
    const pythonExecutable = 'python3'; // Or 'python', or full path to python in .venv

    console.log(`Executing Python script: ${pythonExecutable} ${pythonScriptPath} --phone "${recipient}" --message "${message}"`);

    const pythonProcess = spawn(pythonExecutable, [
      pythonScriptPath,
      '--phone',
      recipient,
      '--message',
      message,
      '--action', // Added action argument
      'send_message' // Specify the action to perform
    ]);

    let scriptOutput = '';
    let scriptError = '';

    pythonProcess.stdout.on('data', (data) => {
      scriptOutput += data.toString();
      console.log(`Python stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      scriptError += data.toString();
      console.error(`Python stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python script exited with code ${code}`);
      if (code === 0) {
        try {
          // Try to parse the output as JSON, assuming the Python script prints JSON
          const result = JSON.parse(scriptOutput);
          if (result.success) {
            res.status(200).json({ success: true, message: 'Message sending process started.', details: result });
          } else {
            res.status(500).json({ success: false, error: 'Python script failed to send message', details: result.error || scriptOutput });
          }
        } catch (e) {
          // If JSON parsing fails, return the raw output
          res.status(200).json({ success: true, message: 'Message sending process started (raw output).', output: scriptOutput });
        }
      } else {
        res.status(500).json({ error: 'Failed to execute WhatsApp script', details: scriptError || `Script exited with code ${code}` });
      }
    });

    pythonProcess.on('error', (err) => {
      console.error('Failed to start Python script:', err);
      res.status(500).json({ error: 'Failed to start WhatsApp script process', details: err.message });
    });

  } catch (error) {
    console.error('Error in send-message API route:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
} 