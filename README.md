# OLX Price Tracker Chrome Extension

A Chrome extension that interacts with OLX advertisement pages to enable users to track or untrack price changes for specific items directly from the ad page.

## Features

1. **Check Subscription**  
   - Sends a `GET` request to the API at `http://localhost:8081/api/check-subscription` to verify whether the user is subscribed to track the price of an item.  
   - Based on the response (`exists: true/false`), the extension dynamically displays either:
     - `➕ Track Price` (if not subscribed)
     - `❌ Remove` (if already subscribed)

2. **Add Subscription**  
   - When the user clicks the `➕ Track Price` button, a `POST` request is sent to `http://localhost:8081/api/subscribe`.  
   - The request includes:
     ```json
     {
       "email": "example@gmail.com",
       "url_link": "https://www.olx.ua/d/uk/obyavlenie/..."
     }
     ```
   - Upon a successful subscription, the button updates to `❌ Remove`.

3. **Delete Subscription**  
   - When the user clicks the `❌ Remove` button, a `DELETE` request is sent to `http://localhost:8081/api/delete-subscription`.  
   - The request includes:
     ```json
     {
       "email": "example@gmail.com",
       "url_link": "https://www.olx.ua/d/uk/obyavlenie/..."
     }
     ```
   - Upon a successful unsubscription, the button updates back to `➕ Track Price`.

4. **Dynamic Updates for Single Page Applications (SPA)**  
   - The extension uses a `MutationObserver` to monitor changes in the DOM. This ensures that the extension works properly when navigating between ads within the same OLX session without requiring a page reload.

---

## Architecture Diagram

```plaintext
User opens an OLX page
           ↓
Extension checks the DOM:
- Finds the price section
- Sends a GET request to /api/check-subscription
           ↓
Is the user subscribed?
       /      \
      Yes      No
      ↓         ↓
Show ❌ Remove   Show ➕ Track Price
           ↓
User clicks the button
       /         \
     ❌           ➕
DELETE Request   POST Request
to API           to API
  |               |
  ↓               ↓
Button updates to:
➕ or ❌ depending on action
