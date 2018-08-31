const model ={
  restaurants: [],
  neighborhoods: [],
  cuisines: []
}

var newMap;
var markers = [];

const view = {
  header: document.querySelector('.header'),
  main: document.querySelector('.main'),
  footer: document.querySelector('.footer'),

//this method sets the constent on every separate screen
  setContent: (whichScreen) => {
    switch (whichScreen) {
      case 'filterScreen':
        view.screenContent = {

          headerContent: `<button id="clear" class="btn right">Clear Filters</button>`,
          mainContent: `<select id="neighborhoods-select" name="neighborhoods">
                                  <option value="all">All Neighborhoods</option>
                                </select>
                                <select id="cuisines-select" name="cuisines">
                                  <option value="all">All Cuisines</option>
                                </select>`,
          footerContent: `<button id="cancel-filter" class="btn footer-btn">cancel</button>
                          <button id="apply-filter" class="btn footer-btn right">apply</button>`
        }
        break;
      case 'listScreen':
        view.screenContent = {
          headerContent: `<nav class="app-name">
                            <h1><a href="/restaurant-reviews-app/">Restaurant Reviews</a></h1>
                          </nav>`,
          mainContent: `<ul id="restaurants-list"></ul>`,
          footerContent: `<span>Copyright (c) 2018 | </span>
                          <a id="reload" href="/restaurant-reviews-app/"><strong> Restaurant Reviews </strong></a>
                          <span>| All Rights Reserved</span>`
        }
        break;
      default:
        view.screenContent = {
          headerContent: `<nav class="app-name">
                            <h1><a href="/restaurant-reviews-app/">Restaurant Reviews</a></h1>
                          </nav>`,
          mainContent: `<section id="map-container">
                          <div id="map"></div>
                        </section>`,
          footerContent: `<button id="list" class="btn footer-btn">show list</button>
                          <button id="filter" class="btn footer-btn">filter</button>`
        }
    }
  },

  homeScreen: {
    init: () => {
      view.setContent('homeScreen');
      view.render.renderActive();
      octopus.fetchRestaurants();
      initMap(); // added

      document.getElementById('map-container').addEventListener('click', view.homeScreen.tapMap);

      const showListBtn = document.getElementById('list');
      showListBtn.addEventListener('click', view.homeScreen.showList);

      const filterBtn = document.getElementById('filter');
      filterBtn.addEventListener('click', view.homeScreen.filter);
    },
    filter: () => {
      //if the section was already created bring it from offscreen to the foreground. if not create it with "view.filterScreen.init()"
      if (!document.querySelector(`section[class="filterScreen go-offscreen"]`)){
        view.filterScreen.init(); //initializes filter screen
        octopus.fetchNeighborhoods();
        octopus.fetchCuisines();
      } else {
          view.filterScreen.clear();
          view.handleScreens(document.querySelector('.filterScreen'));
      }
      const filterMain = document.querySelector(".filter-div");
      filterMain.tabIndex = -1;
      filterMain.focus();

      // const home = document.querySelector('#homeScreen');
      // home.classList.remove('home-init');
      // view.handleScreens(home);

    },
    showList: () => {
      const home = document.querySelector('#homeScreen[class="go-active"]');
      if (home) {
        view.handleScreens(home);
      }

      if(document.querySelector(`section[class="filterScreen go-active"]`)){
        view.handleScreens(document.querySelector(`section[class="filterScreen go-active"]`));
      }
      document.querySelector('body').className = 'auto';

      //if the section was already created bring it from offscreen to the foreground. if not create it with "view.listScreen.init()"
      if (!document.querySelector(`section[class="listScreen go-offscreen"]`)){
        view.listScreen.init();
      } else {
        view.listScreen.fillRestaurantsHTML(model.restaurants);
        view.handleScreens(document.querySelector('.listScreen'));
      }
      const listDiv = document.getElementById('restaurants-list').parentNode;
      listDiv.classList.add('list-div');
      listDiv.classList.remove('filter-div');

    },
    //this method display the map full screen if the map is tapped
    tapMap: () => {
      view.main.classList.toggle('whole-height');
      view.header.classList.toggle('go-offscreen');
      view.footer.classList.toggle('go-offscreen');
      setTimeout(function(){ //this is necessary to resize mapbox if the container dimension is changed
        DBHelper.resizeMap(self.newMap);
      },500);
    }
  },
//FILTER SCREEN
  filterScreen: {
    init: () => {

      view.setContent('filterScreen');
      view.render.renderUpComing('filterScreen');

      const clearBtn = document.getElementById('clear');
      clearBtn.addEventListener('click', view.filterScreen.clear);
      clearBtn.addEventListener('keydown', function(e){
        view.filterScreen.trapTab(e);
      });

      const applyBtn = document.getElementById('apply-filter');
      applyBtn.addEventListener('click', view.filterScreen.apply);
      applyBtn.addEventListener('keydown', function(e){
        view.filterScreen.trapTab(e);
      });

      const cancelBtn = document.getElementById('cancel-filter');
      cancelBtn.addEventListener('click', view.filterScreen.cancel);
    },
    //clear filters to its default values
    clear: () => {
      const cSelect = document.getElementById('cuisines-select');
      const nSelect = document.getElementById('neighborhoods-select');

      cSelect.selectedIndex = 0;
      nSelect.selectedIndex = 0;
    },
//apply the filters on the map and shows the list of the restaurants that meet filter criteria
    apply: () => {
      octopus.updateRestaurants().then(() => {view.homeScreen.showList();});
      view.handleScreens(document.querySelector('.filterScreen'));
    },
//cancel the filter screen and displays the map again
    cancel: () => {
      view.handleScreens(document.querySelector('.filterScreen'));
      document.getElementById('filter').focus();
      setTimeout(function(){
        DBHelper.resizeMap(self.newMap);
      },500);
    },
    //traps the focus inside the filters screen
    trapTab: (e) => {
      const apply = document.getElementById("apply-filter");
      const clear = document.getElementById("clear");
      if (e.keyCode === 9){
        if (e.shiftKey){
          if (document.activeElement === clear) {
            e.preventDefault();
            apply.focus();
          }
        }
        else if (document.activeElement === apply) {
          e.preventDefault();
          clear.focus();
        }
      }
    }
  },
//LIST OF RESTAURANTS SCREEN
  listScreen: {
    init: () => {
      view.setContent('listScreen');
      view.render.renderUpComing('listScreen');
      document.querySelector('a[id="reload"]').parentNode.classList.add('copyright');
      view.listScreen.fillRestaurantsHTML(model.restaurants);
    },
//fill the restaurant list once the filter is apply or the SHOWLIST button is pressed on home screen
    fillRestaurantsHTML: (restaurants = model.restaurants) => {
      const ul = document.getElementById('restaurants-list');
      if (ul){
        octopus.resetRestaurants(model.restaurants);  //resets the previous list if exist
      }
      //if there is restaurants meeting the filters it will append the map to the list
      if (restaurants.length !==0) {
        document.querySelector('.listScreen').insertBefore(document.getElementById('map-container'), ul.parentNode);
        document.getElementById('map-container').removeEventListener('click', view.homeScreen.tapMap);
      } else view.handleScreens(document.querySelector('#homeScreen'));
      setTimeout(function(){
        DBHelper.resizeMap(self.newMap);
        self.newMap.zoomOut(0.5);
      },500);
      if (restaurants.length !== 0){
        restaurants.forEach(restaurant => {
          ul.appendChild(view.createRestaurantHTML(restaurant));
        });
      } else {  //shows no restaurant message and show go-back button to filters
          const li = document.createElement('li');
          li.innerHTML = `<p class="no-results">Sorry, there is no restaurants that meet that criteria. Try a different search!</p>
                          <button id="back-to-filters" class="btn">Go Back</button>`;
          li.className = 'back';
          ul.append(li);
          document.getElementById('back-to-filters').addEventListener('click', function(){
            view.handleScreens(document.querySelector('.listScreen'));
            view.handleScreens(document.querySelector('.filterScreen'));
          });
          document.querySelector('body').className = 'overflowHidden';
        }
    },

  },
//it renders the home screen, and any screen if it is desired to display it instantly
  render: {
    renderActive: () => {
      view.header.innerHTML = view.screenContent.headerContent;
      view.main.innerHTML = view.screenContent.mainContent;
      view.footer.innerHTML = view.screenContent.footerContent;
    },
//similar to render method, but it creates a section which will go as the main section displayed on screen as a slide in animation
    renderUpComing: (whichScreen) => {
        const piece = document.createDocumentFragment();
        const section = document.createElement('section');
        section.innerHTML = `<header class="header">${view.screenContent.headerContent}</header>
                              <main class="main filter-div">${view.screenContent.mainContent}</main>
                              <footer class="footer">${view.screenContent.footerContent}</footer>`;

        piece.appendChild(section);
        document.body.appendChild(piece);
        section.className = whichScreen;
        section.classList.add('go-active');
    }
  },
//populates the neightborhood' s select
  fillNeighborhoodsHTML: (neighborhoods = model.neighborhoods) => {
    const select = document.getElementById('neighborhoods-select');
    neighborhoods.forEach(neighborhood => {
      const option = document.createElement('option');
      option.innerHTML = neighborhood;
      option.value = neighborhood;
      select.append(option);
    });
  },
  //populates the cuisines' s select
  fillCuisinesHTML: (cuisines = model.cuisines) => {
    const select = document.getElementById('cuisines-select');

    cuisines.forEach(cuisine => {
      const option = document.createElement('option');
      option.innerHTML = cuisine;
      option.value = cuisine;
      select.append(option);
    });
  },
//populates the restaurant info on the list of restaurants
  createRestaurantHTML: (restaurant) => {
    const li = document.createElement('li');

    const image = document.createElement('img');
    image.className = 'restaurant-img';
    image.src = DBHelper.imageUrlForRestaurant(restaurant);
    image.setAttribute("alt", `An image of the restaurant ${restaurant.name} with ${restaurant.cuisine_type} cuisine`);
    li.append(image);

    const name = document.createElement('h2');
    name.innerHTML = restaurant.name;
    li.append(name);

    const ratingDiv = document.createElement('div');
    const rating = new Rating(restaurant);
    rating.defineStars();
    ratingDiv.innerHTML = `<span> ${rating.points}</span><span> ${rating.stars}</span><span>(${rating.reviewsNumber})</span> <span>${restaurant.cuisine_type} </span>`;
    li.append(ratingDiv);

    const neighborhood = document.createElement('p');
    neighborhood.innerHTML = `<i class="fa fa-map-marker"></i>${restaurant.neighborhood}`;
    li.append(neighborhood);

    const address = document.createElement('p');
    address.innerHTML = restaurant.address;
    li.append(address);

    const more = document.createElement('a');
    more.innerHTML = 'View Details';
    more.href = DBHelper.urlForRestaurant(restaurant);
    more.setAttribute("aria-label", `restaurant ${restaurant.name} details`);
    li.append(more)

    return li;
  },
// this method toggles visibility of screens
  handleScreens: (toggledScreen) => {
    toggledScreen.classList.toggle('go-active');
    toggledScreen.classList.toggle('go-offscreen');
  }
}

//INITIALIZATION************************
document.addEventListener('DOMContentLoaded', (event) => {
  view.homeScreen.init();

  let deferredPrompt;
// it is not firing
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallevent fired');
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;

    deferredPrompt.prompt();
  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice
    .then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      deferredPrompt = null;
    });
  });
});

const octopus = {
  fetchNeighborhoods:  () => {
    DBHelper.fetchNeighborhoods((error, neighborhoods) => {
      if (error) { // Got an error
        console.error(error);
      } else {
        model.neighborhoods = neighborhoods;
        view.fillNeighborhoodsHTML();
      }
    });
  },

  fetchCuisines: () => {
    DBHelper.fetchCuisines((error, cuisines) => {
      if (error) { // Got an error!
        console.error(error);
      } else {
        model.cuisines = cuisines;
        view.fillCuisinesHTML();
      }
    });
  },

  fetchRestaurants: (cuisine = 'all', neighborhood = 'all') => {
    DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
      if (error) { // Got an error!
        console.error(error);
      } else {
        model.restaurants = restaurants;
        octopus.addMarkersToMap(model.restaurants);
      }
    });
  },

  addMarkersToMap: (restaurants = model.restaurants) => {
    restaurants.forEach(restaurant => {
      // Add marker to the map
      const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
      marker.on("click", onClick);
      marker.tabIndex = -1;
      function onClick() {
        window.location.href = marker.options.url;
      }
      self.markers.push(marker);
    });
  },
//this method is gonna be called every time a filter is applied. RETURNS A PROMISE
  updateRestaurants: () => {
    return new Promise(function(resolve, reject){
      const cSelect = document.getElementById('cuisines-select');
      const nSelect = document.getElementById('neighborhoods-select');

      const cIndex = cSelect.selectedIndex;
      const nIndex = nSelect.selectedIndex;

      const cuisine = cSelect[cIndex].value;
      const neighborhood = nSelect[nIndex].value;

      DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
        if (error) { // Got an error!
          console.error(error);
        } else {
          model.restaurants = restaurants;
          octopus.resetMarkers();
          octopus.addMarkersToMap(model.restaurants);
          resolve();
        }
      });
    });

  },
  // Remove all restaurants
  resetRestaurants: (restaurants) => {
    model.restaurants = [];
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';

    model.restaurants = restaurants;
  },

  // Remove all map markers
  resetMarkers: () => {
    if (self.markers) {
      self.markers.forEach(marker => marker.remove());
    }
    self.markers = [];
  }
}
// MAPbox API
initMap = () => {
  self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false
      });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1IjoibWF5Z3VlbiIsImEiOiJjamtxODg3a28xbHluM3dwOGh3dndpMzFlIn0.yTv3Ada0WEVS3uUlLk9-ow',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(newMap);
}
