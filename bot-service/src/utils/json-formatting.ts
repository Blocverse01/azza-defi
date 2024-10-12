function cleanJsonString(jsonString: string): string {
    // Remove trailing commas before closing braces
    let cleaned = jsonString.replace(/,\s*([\]}])/g, '$1'); // Remove trailing commas
    cleaned = cleaned.replace(/([{,])\s*"/g, '$1"'); // Remove any spaces before quotes
    cleaned = cleaned.replace(/"\s*:/g, '":'); // Remove spaces after quotes and before colon
    return cleaned;
}

function isValidJson(jsonString: string): boolean {
    try {
        JSON.parse(jsonString);
        return true;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return false;
    }
}

export function extractJson(response: string): unknown | null {
    // Match JSON in response
    const jsonMatch = response.match(/({.*?})/s);

    if (jsonMatch) {
        const jsonResponse = jsonMatch[0];

        // Clean the JSON string
        const cleanedJson = cleanJsonString(jsonResponse);

        // Ensure the cleaned JSON is properly closed
        const closingBracesCount = (cleanedJson.match(/}/g) || []).length;
        const openingBracesCount = (cleanedJson.match(/{/g) || []).length;

        // Append missing closing braces manually
        let fixedJson = cleanedJson;
        for (let i = 0; i < openingBracesCount - closingBracesCount; i++) {
            fixedJson += '}';
        }

        // Validate before attempting to parse
        if (isValidJson(fixedJson)) {
            return JSON.parse(fixedJson);
        } else {
            console.error('Invalid JSON:', fixedJson); // Log invalid JSON
        }
    } else {
        console.error('No JSON found in the response.');
    }

    return null; // Return null if parsing fails
}
