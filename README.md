# Time sheet

Automate filling timesheet

## Usage

Clone the project and install dependencies

```bash
npm i
```

Finally run the project

```bash
yd
```

## Setup Google Calendar

To import tasks from the Google Calendar you will need to follow the following Steps:

<ol>
    <li> Visit the google api
        <a href="https://console.cloud.google.com/apis/credentials">API-Console</a>
    </li>
    <li> Click create Credentials and choose <u>OAuth Client Id</u> </li>
    <li> Choose iOS as Application Type and com.raycast as the Bundle ID </li>
</ol>
Finally you have the client id <br>
You now need to set the Google Calendar client in the Extension configuration 
Checkout <br>
<a href="https://manual.raycast.com/preferences">Raycase Manual for instructions on how to do so</a> 


## Features
 * Crete,edit,delete tasks
 * Export tasks to json file
 * Import tasks from google calendar
 * Duplicate task 
