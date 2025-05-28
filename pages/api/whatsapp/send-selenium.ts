import { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, message } = req.body;

  if (!phoneNumber || !message) {
    return res.status(400).json({
      error: 'Missing required fields: phoneNumber and message'
    });
  }

  console.log(`[Selenium WhatsApp API] Attempting to send message to ${phoneNumber}`);

  try {
    // Correctly resolve the path to the Python script
    // Assuming the script is in src/whatsapp/open-source/services/
    const scriptPath = path.resolve(process.cwd(), 'src/whatsapp/open-source/services/whatsapp_service_selenium.py');
    const pythonProcess = spawn('python3', [scriptPath, '--phone', phoneNumber, '--message', message]);

    let scriptOutput = '';
    let scriptError = '';

    pythonProcess.stdout.on('data', (data) => {
      scriptOutput += data.toString();
      console.log(`[Selenium Script STDOUT]: ${data.toString()}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      scriptError += data.toString();
      console.error(`[Selenium Script STDERR]: ${data.toString()}`);
    });

    const exitCode = await new Promise<number>((resolve) => {
      pythonProcess.on('close', resolve);
    });

    if (exitCode === 0) {
      console.log(`[Selenium WhatsApp API] Python script executed successfully for ${phoneNumber}. Output: ${scriptOutput}`);
      // Attempt to parse scriptOutput if it's JSON, otherwise return as string
      let parsedOutput;
      try {
        parsedOutput = JSON.parse(scriptOutput);
      } catch (e) {
        parsedOutput = scriptOutput; // Keep as string if not valid JSON
      }
      return res.status(200).json({
        success: true,
        message: 'Message sending process initiated via Selenium',
        scriptOutput: parsedOutput
      });
    } else {
      console.error(`[Selenium WhatsApp API] Python script exited with code ${exitCode} for ${phoneNumber}. Error: ${scriptError}`);
      return res.status(500).json({
        success: false,
        error: 'Python script execution failed',
        exitCode,
        scriptError
      });
    }

  } catch (error) {
    console.error('[Selenium WhatsApp API] Error spawning Python script:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initiate Selenium message sending',
      details: error instanceof Error ? error.stack : null
    });
  }
} 