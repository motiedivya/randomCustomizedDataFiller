# Chrome Extension: Form Filler with Random Value Generator

This Chrome extension automates form filling by generating random values based on specific field types (email, phone number, etc.). It uses a random string generator to populate forms on websites. This can be useful for testing or filling out repetitive forms with random values quickly.

## Features
- Automatically fills in form fields with random values.
- Supports email, phone, and regex-based field types.
- Can be configured to fill forms on any webpage with a customizable configuration.
- Easily configurable via a simple JSON configuration passed from the background script.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [How It Works](#how-it-works)
- [Folder Structure](#folder-structure)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Installation

### 1. Clone the Repository
Clone this repository to your local machine:
```bash
git clone https://github.com/your-username/form-filler-extension.git
cd form-filler-extension
```

### 2. Load the Extension in Chrome
1. Open Chrome and go to `chrome://extensions/`.
2. Enable **Developer mode** by toggling the switch at the top right.
3. Click on **Load unpacked**.
4. Select the folder where the extension is located (the folder with the `manifest.json`).

Your extension will now be available in Chrome.

## Usage

Once the extension is installed, it can automatically fill in form fields on any webpage based on the configuration set in the background script.

### How to Trigger Form Filling
To trigger form filling, the extension listens for messages from the content script. You can send a message from a different script or use the extension's popup (if available) to trigger form filling.

The message should look like:
```javascript
chrome.runtime.sendMessage({
  action: 'fillForm',
  config: {
    fields: [
      { selector: '#email', type: 'email' },
      { selector: '#phone', type: 'phone' }
    ]
  }
});
```

The extension will:
- Use a random string generator to fill fields based on their `type`.
- Trigger the `input` event to simulate the form being filled out.

### Supported Field Types:
- **email**: Fills the field with a randomly generated email address (`example@domain.com`).
- **phone**: Fills the field with a randomly generated phone number.
- **regex**: Supports custom regular expression patterns for generating values.

## How It Works

This extension uses the `chrome.runtime.sendMessage` API to send commands between background and content scripts. When the `fillForm` action is triggered, the background script generates random values using predefined rules and sends the values back to the content script to populate the fields on the webpage.

### Workflow
1. The **background script** listens for the `fillForm` action and generates random values for the fields specified in the configuration.
2. The **content script** listens for the values, applies them to the form fields, and dispatches the input event to update the page.
3. The **generator script** is responsible for generating random values like emails, phone numbers, and custom regex-based patterns.

### Communication Between Scripts
- The content script listens for messages to populate form fields.
- The background script uses `chrome.runtime.sendMessage` to process these requests, using helper functions from `generator.js` to create the random values.

### Key Components:
- **`background.js`**: Handles requests to generate random values and injects content scripts into web pages.
- **`content.js`**: Manages the form filling process on the web page and triggers the form field updates.
- **`generator.js`**: Contains the logic for generating random values, including email, phone number, and regex-based fields.

## Folder Structure
The project has the following folder structure:
```
form-filler-extension/
├── js/
│   ├── generator.js      # Logic for generating random values
│   ├── content.js        # Content script that interacts with the web page
│   └── background.js     # Background script to handle communication and inject content script
├── manifest.json         # Chrome extension configuration
└── README.md             # Project documentation
```

## Configuration

The extension's configuration is passed in the form of a JSON object. It contains an array of `fields` where each field specifies the `selector` (CSS selector for the input field) and the `type` of the field (e.g., `email`, `phone`, etc.).

### Example Configuration:
```javascript
{
  action: 'fillForm',
  config: {
    fields: [
      { selector: '#email', type: 'email' },
      { selector: '#phone', type: 'phone' },
      { selector: '#customField', type: 'regex', regex: '[A-Z]{5}[0-9]{3}' }
    ]
  }
}
```

## Contributing

We welcome contributions to improve this extension!

### How to Contribute:
1. Fork the repository.
2. Create a new branch for your feature/fix (`git checkout -b feature-name`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature-name`).
5. Open a pull request describing your changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
