# GitHub to Freshdesk Integration

This is a command-line tool that retrieves information of a GitHub user and creates or updates a contact in Freshdesk using their respective APIs.

## Requirements

- Node.js 20.x or later
- Git
- Freshdesk API Key
- GitHub Personal Access Token

## Installation

1. Clone the repository:
    ```sh
    git clone <repository-url>
    cd <repository-directory>
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file in the root directory of the project and add the following environment variables:
    ```env
    GITHUB_TOKEN=<your_github_personal_access_token>
    FRESHDESK_TOKEN=<your_freshdesk_api_key>
    ```
   
## Building the Script

To build the script, use the following command:
```sh
  npm run build
```

The script will be compiled to the `dist` directory.

## Running the Script

To run the script, use the following command:
```sh
npm start <github_username> <freshdesk_subdomain>
```

You need to provide a GitHub username and a Freshdesk subdomain as arguments. For example:
```sh
npm start snaksa prime-supportdesk
```

The script will try to execute requests to the following Freshdesk API endpoint: `https://prime-supportdesk.freshdesk.com`

## Testing

To run the tests, use the following command:
```sh
npm test
```

To generate a coverage report, use the following command:
```sh
npm test -- --coverage
```