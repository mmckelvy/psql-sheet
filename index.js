const path = require('path');
const { google } = require('googleapis');
const { authenticate } = require('@google-cloud/local-auth');

async function authenticateServiceAccount(pathToKeyFile) {
  const auth = new google.auth.GoogleAuth({
    keyFile: pathToKeyFile,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive'
    ],
  });
  return auth.getClient();
}

async function writeToSheet(config, rows) {
  const auth = await authenticateServiceAccount(config.pathToKeyFile);

  const sheets = google.sheets({version: 'v4', auth});

  await sheets.spreadsheets.values.update({
    spreadsheetId: config.spreadsheetId,
    range: config.range,
    valueInputOption: 'RAW',
    resource: {
      values: rows
    }
  });
}

module.exports = async function psqlSheet(config) {
  process.stdin.setEncoding('utf8');

  let buffer = ''; // Buffer to accumulate partial rows from chunks

  process.stdin.on('data', async (chunk) => {
    buffer += chunk;

    // Split data into complete lines (rows)
    const lines = buffer.split('\n');
    buffer = lines.pop(); // Keep the last incomplete line in the buffer
    if (lines.length > 0) {
      const rows = lines.map((line) => line.split(',')); // Parse CSV rows
      try {
        await writeToSheet(config, rows);
      } catch (error) {
        console.error('Error writing to Google Sheets:', error.message);
      }
    }
  });

  process.stdin.on('end', async () => {
    if (buffer.trim()) {
      const rows = [buffer.split(',')]; // Process remaining buffered data
      try {
        await writeToSheet(config, rows);
      } catch (error) {
        console.error('Error writing to Google Sheets:', error.message);
      }
    }
  });
}
