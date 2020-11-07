# Instaview
A simple tool to display the contens of a GPDR Zip-File from Instagram

#Requirements
NodeJS (I tested it with 11.9.0 but newer versions should also work)

#Setup
1. Copy the tool into the directory of the unpacked zip-file
2. Install the NodeJS dependencies with ´npm install´

#Usage
Run server.js and access the page in your Browser on http://localhost/

#Known Issues
Following *.json-files are not supported, because they're empty in my dump:
- autofill.json
- events.json
- fundraisers.json
- guides.json
- saved.json
- searches.json
- shopping.json
- uploaded_contacts.json
