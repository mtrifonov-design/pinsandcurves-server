const serverUrl = 'http://127.0.0.1:3000';

// Function to fetch JSON from the server
async function fetchJson() {
    try {
        const response = await fetch(`${serverUrl}/get-json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        //console.log('Fetched JSON:', data);
        return { data };
        
    } catch (error : any) {
        return { error: error.message };
    }
}

// Function to send updated JSON to the server
async function setJson(newData : any) {
    try {
        const response = await fetch(`${serverUrl}/set-json`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newData)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        //console.log('Set JSON response:', result);

        // Optionally re-fetch data to confirm updates
        // fetchJson();
    } catch (error) {
        console.error('Error setting JSON:', error);
    }
}

export { fetchJson, setJson };