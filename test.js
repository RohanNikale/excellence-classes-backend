const fs = require('fs');

function jsonToBase64Txt(inputJsonPath, outputTxtPath) {
    try {
        // Read the JSON file
        const data = fs.readFileSync(inputJsonPath, 'utf8');
        
        // Convert the JSON data to a string
        const jsonStr = JSON.stringify(JSON.parse(data));
        
        // Encode the string to base64
        const base64Str = Buffer.from(jsonStr, 'utf8').toString('base64');
        
        // Write the base64-encoded string to the output text file
        fs.writeFileSync(outputTxtPath, base64Str, 'utf8');
        
        console.log(`JSON file has been successfully converted to base64 and saved as ${outputTxtPath}`);
    } catch (error) {
        console.error(`An error occurred: ${error.message}`);
    }
}

// Example usage
jsonToBase64Txt('config/excellence-coaching-centre-03318aed9cbe.json', 'credentials_base64.txt');
