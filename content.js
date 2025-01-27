const functionsToRun = [];
let timeout;

function addFunctionToRun(fn) {
    if (typeof fn === 'function') {
        functionsToRun.push(fn);
    }
}

function runFunctions() {
    functionsToRun.forEach((fn) => fn());
}

function initializeObserver() {
    const observer = new MutationObserver(() => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            runFunctions();
        }, 500); 
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

function test() {
    const currentUrl = window.location.href;
    console.log('Page loaded');
    console.log(currentUrl);
}

/**
 * Function to check subscription status via API
 * @returns {Promise<boolean>} - Returns true if subscription exists, otherwise false
 */
async function checkSubscription() {
    const apiUrl = 'http://localhost:8081/api/check-subscription';
    const params = {
        email: 'susenko.andrii@gmail.com',
        url_link: window.location.href 
    };

    const queryString = new URLSearchParams(params).toString();
    const fullUrl = `${apiUrl}?${queryString}`;

    try {
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Error fetching subscription status:', response.statusText);
            return false;
        }

        const data = await response.json();
        return data.exists === true;
    } catch (error) {
        console.error('Fetch error:', error);
        return false;
    }
}

async function subscribe() {
    const apiUrl = 'http://localhost:8081/api/subscribe';
    const payload = {
        "email": "susenko.andrii@gmail.com",
        "url_link": window.location.href
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Subscription Response:', data);

        // Optionally refresh the button text if successful
        if (data.success) {
            alert('Ви успішно підписались!');
            // Optionally update the button to '❌ Видалити'
            $('#parserButton').text('❌ Видалити');
            $('#parserButton').on('click', (e) => {
                e.preventDefault();
                deleteSubscription();
            });
        }
    } catch (error) {
        console.error('Error during subscription:', error);
        alert('Failed to subscribe. Please try again later.');
    }
}

async function deleteSubscription() {
    const apiUrl = 'http://localhost:8081/api/delete-subscription';
    const payload = {
        "email": "susenko.andrii@gmail.com",
        "url_link": window.location.href
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Delete Subscription Response:', data);

        // Optionally refresh the button text if successful
        if (data.success) {
            alert('Ви успішно відписались!');
            // Optionally update the button to '➕ Відстежувати ціну'
            $('#parserButton').text('➕ Відстежувати ціну').off('click').on('click', (e) => {
                e.preventDefault();
                subscribe();
            });
        }
    } catch (error) {
        console.error('Error during delete subscription:', error);
        alert('Failed to unsubscribe. Please try again later.');
    }
}

async function addParserButton() 
{
    const priceContainer = $('div[data-testid="ad-price-container"]');
    if (priceContainer.length < 1 || $('#parserButton').length !== 0) {
        return;
    }
    console.log('Adding parser button');
    const isSubscribed = await checkSubscription();
    
    if (!isSubscribed) {
            priceContainer.append(`
                    <a href="#" id="parserButton" style="font-size: 12px; color: #007bff; text-decoration: none; margin-top: 5px; display: block;">
                        ➕ Відстежувати ціну
                    </a>
            `);

            $('#parserButton').on('click', (e) => {
                e.preventDefault();
                subscribe();
            });
    } else {
            priceContainer.append(`
                    <a href="#" id="parserButton" style="font-size: 12px; color: #007bff; text-decoration: none; margin-top: 5px; display: block;">
                       ❌ Видалити
                    </a>
            `); 

            $('#parserButton').on('click', (e) => {
                e.preventDefault();
                deleteSubscription();
            });
    }
}

// Add functions to the queue
addFunctionToRun(test);
addFunctionToRun(addParserButton);

// Run the functions initially and set up the observer
runFunctions();
initializeObserver();
