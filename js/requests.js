function makeRequest(url) {
    return new Promise((resolve, reject) => {
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.onload = function () {
            if (request.status == 200) {
                resolve(JSON.parse(request.responseText));
            } else {
                reject("Error loading " + url);
            }
        };
        request.onerror = function () {
            reject("Network error occurred");
        };
        request.send();
    });
}

async function fetchData() {
    try {
        const education = await makeRequest(EDUCATION_DATA);
        const county = await makeRequest(COUNTY_DATA);
        return {
            education: education,
            county: county
        };
    } catch (error) {
        console.error(error);
    }
}
