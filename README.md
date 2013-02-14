Doppelganger examples
=====================

_Demonstration of server-side Backbone.js apps using [Doppelganger](https://github.com/timkendrick/doppelganger)_


# Installation

```bash
# Clone the github repository
git clone git@github.com:timkendrick/doppelganger-examples.git

# Change the current directory to the repository folder
cd doppelganger-examples

# Install the package dependencies
npm install

# Start the server
npm start

# View the site in your web browser
open http://localhost:8000/
```

# Configuration options

## Listen on a different port

```bash
# Update the server configuration
npm config set doppelganger-examples:port 1337

# Start the server
npm start

# View the site in your web browser
open http://localhost:1337/
```

## Run in debug mode (throw all errors)

```bash
# Update the server configuration
npm config set doppelganger-examples:debug true

# Start the server
npm start

# View the site in your web browser
open http://localhost:1337/
```