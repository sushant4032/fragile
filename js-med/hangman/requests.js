var getCountry = (country, callback) => {
    const url = "https://restcountries.eu/rest/v2/all";
    const method = "GET";
    xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                const countries = JSON.parse(xhr.responseText);
                if (countries.length > 0) {
                    countries.forEach((x) => {
                        if (x.alpha2Code == countryCode) {
                            callback(undefined, x.name);
                        }
                    })
                }
            }
            else {
                callback("not 200 error", undefined);
            }
        }
    }
}

