# psqlSheet

Output your psql queries to Google Sheets.

# Usage

## Configure your Google account

1.  Create a Google Cloud Project:
  * Go to Google Cloud Console
  * Click "New Project" and create one
  * Note your Project ID

2.  Enable the necessary APIs:
  * In Cloud Console, go to "APIs & Services" > "Library"
  * Search for and enable:
  * Google Sheets API
  * Google Drive API

3.  Create Service Account credentials:
  * Go to "APIs & Services" > "Credentials"
  * Click "Create Credentials" > "Service Account"
  * Fill in service account details
  * Click "Create and Continue"
  * Click "Done"
  * Find the service account in the credentials page
  * Click on it and go to "Keys" tab
  * Add Key > Create new key > JSON
  * Download the JSON key file
  * Add the JSON key file to your project

## Set up a script to receive your psql query output

Create a .js file, make it an executable (`chmod +x your-file.js`) and instantiate `psqlSheet`.  Pass in the ID of the Sheet you want to use to capture your psql output along with the range and the path to your JSON key file.  Don't forget to add the shebang to the top of the file.

```javascript
#!/usr/bin/env node

const path = require('path');

const psqlSheet = require('psql-sheet');

(async function () {
  await psqlSheet({
    // The ID of your Google Sheet
    spreadsheetId: '1a11vRgR5uZ8oyX9oAgaYqyupnCLbw9ZULzMmuKC7lS4',
     // The range where you want the query results to populate.
    range: 'Sheet1!A1',
     // Your Google service account credentials.
    pathToKeyFile: path.join(__dirname, 'key.json')
  });
})();
```

## Pipe your psql output to your .js script.

```

# connect to your DB
psql -d your-db

# Set the output format to csv with no footers and pipe it to the file you just created.
[local]:5432 yourusername@your-db=# \pset footer off \a \f ',' \o |./your-file.js

```

## Share the Google Sheet with your service account email

Find your service account email under the `client_email` property in your JSON key file.

## Run your queries

```
[local]:5432 yourusername@your-db=# select * from my_table;
```

The results will show up in your Google Sheet.
