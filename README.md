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
```

Once the server is up and running, you can access the examples at [http://localhost:8000/](http://localhost:8000/)

View source to see the content that is being inserted by the server-side app instance. 


# Configuration options

## Listen on a different port

```bash
# Update the server configuration
npm config set doppelganger-examples:port 1337

# Start the server
npm start
```

## Run in debug mode (halt on all errors)

```bash
# Update the server configuration
npm config set doppelganger-examples:debug true

# Start the server
npm start
```