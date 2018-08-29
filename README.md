# Project Title

Restaurant Reviews App

## Overview

This app uses a reviews database to pull the customer reviews on ten restaurants in new York City. It places the restaurants on a map that uses Mapbox API, and display restaurants details on a separate page.

This app was tested using Google Lighthouse tool, and it meets the criteria for PWA. It is:

* **Secure**: Served over HTTPS

* **Responsive**: Developed with a mobile first approach, adaptively serving a viewport-friendly site.

* **Offline first**: Uses a service worker to handle fetch request serving content from Cache when connectivity is not available, and updating the cache with every network request.

* **Cross-browser**: The app works properly on every browser.

* **Add to home screen feature**: The app meets the criteria to trigger a `beforeinstallprompt` event to be able to notify the user that the app is available to install (Add to home screen).

* **Accessible** The app is accessible to screen reader users.

## What you'll need

You will need a [Mapbox API key](https://www.mapbox.com/install/) to have access to the map. Replace the text `<your MAPBOX API KEY HERE>` inside of `main.js` and `restaurant_info.js` with your key. Both files are in the [js](https://github.com/Mindgames55/restaurant-reviews-app/tree/master/js) folder.

## Tecnical info

Functionality of the app is achieved with JavaScript, dynamically generating sections on the document based on user interaction.

## Dependencies

* [Database](https://github.com/Mindgames55/restaurant-reviews-app/blob/master/data/restaurants.json) - Json file containing the data for this app. Provided by [Udacity](https://www.udacity.com/)

* [font-awesome](https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css) - Font-awesome library

* [Mapbox API](https://www.mapbox.com/) - Map

* [Normalize css](//normalize-css.googlecode.com/svn/trunk/normalize.css) - To bring consistency across browsers

* [Leaf-let css](https://unpkg.com/leaflet@1.3.1/dist/leaflet.css) - Map styling

## Known Issues

Even when the app meets the criteria to trigger the `beforeinstallprompt` event, it does not on mobile devices. The `Add to Home Screen` button on `manifest.json` over Chrome Devtools works.  


## Acknowledgements
* [Udacity](https://www.udacity.com/) - For providing the starting code

* [Google Maps](https://www.google.com/maps) - Took as an inspiration for user experience

## Author

* **Mayguen Ojeda** - *Udacity fifth project*
