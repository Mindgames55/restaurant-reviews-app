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
          headerContent: `<nav>
                            <h1><a href="/">Restaurant Reviews</a></h1>
                          </nav>`,
          mainContent: `<ul id="restaurants-list"></ul>`,
          footerContent: `<span>Copyright (c) 2018 | </span>
                          <a id="reload" href="/"><strong> Restaurant Reviews </strong></a>
                          <span>| All Rights Reserved</span>`
        }
        break;
      default:
        view.screenContent = {
          headerContent: `<nav>
                            <h1><a href="/">Restaurant Reviews</a></h1>
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

///FIX EVENT LISTENER ON MARKERS
      // view.main.addEventListener('click', function(e){
      //   console.log(e.target);
      //   if (e.target !== 'IMG')
      //   view.homeScreen.tapMap();
      // });

      const showListBtn = document.getElementById('list');
      showListBtn.addEventListener('click', view.homeScreen.showList);

      const filterBtn = document.getElementById('filter');
      filterBtn.addEventListener('click', view.homeScreen.filter);
    },
    filter: () => {
      if (!document.querySelector(`section[class="filterScreen go-offscreen"]`)){
        view.filterScreen.init();
        octopus.fetchNeighborhoods();
        octopus.fetchCuisines();
      } else {
          view.filterScreen.clear();
          view.handleScreens(document.querySelector('.filterScreen'));
      }

    },
    showList: () => {
      document.querySelector('body').className = 'auto';
      view.listScreen.init();
      const listDiv = document.getElementById('restaurants-list').parentNode;
      listDiv.classList.add('list-div');
      listDiv.classList.remove('filter-div');

    },
    tapMap: () => {
      view.main.classList.toggle('whole-height');
      view.header.classList.toggle('go-offscreen');
      view.footer.classList.toggle('go-offscreen');
    }
  },

  filterScreen: {
    init: () => {

      view.setContent('filterScreen');
      view.render.renderUpComing('filterScreen');

      const clearBtn = document.getElementById('clear');
      clearBtn.addEventListener('click', view.filterScreen.clear);

      const applyBtn = document.getElementById('apply-filter');
      applyBtn.addEventListener('click', view.filterScreen.apply);

      const cancelBtn = document.getElementById('cancel-filter');
      cancelBtn.addEventListener('click', view.filterScreen.cancel);
    },

    clear: () => {
      const cSelect = document.getElementById('cuisines-select');
      const nSelect = document.getElementById('neighborhoods-select');

      cSelect.selectedIndex = 0;
      nSelect.selectedIndex = 0;
    },

    apply: () => {
      octopus.updateRestaurants().then(() => {view.homeScreen.showList();});
      view.handleScreens(document.querySelector('.filterScreen'));
    },

    cancel: () => {
      view.handleScreens(document.querySelector('.go-active'));
    }
  },

  listScreen: {
    init: () => {
      view.setContent('listScreen');
      view.render.renderUpComing('listScreen');
      document.querySelector('a[id="reload"]').parentNode.classList.add('copyright');
      view.listScreen.fillRestaurantsHTML(model.restaurants);
    },

    fillRestaurantsHTML: (restaurants = model.restaurants) => {
      const ul = document.getElementById('restaurants-list');
      if (restaurants.length !== 0){
        restaurants.forEach(restaurant => {
          ul.appendChild(view.createRestaurantHTML(restaurant));
        });
      } else {
          const li = document.createElement('li');
          li.innerHTML = `<p class="no-results">Sorry, there is no restaurants that meet that criteria. Try a different search!</p>
                          <button id="back-to-filters" class="btn">Go Back</button>`;
          ul.append(li);
          document.getElementById('back-to-filters').addEventListener('click', function(){
            view.handleScreens(document.querySelector('.listScreen'));
            view.handleScreens(document.querySelector('.filterScreen'));
          });
          document.querySelector('body').className = 'overflowHidden';
        }
    },

  },

  render: {
    renderActive: () => {
      view.header.innerHTML = view.screenContent.headerContent;
      view.main.innerHTML = view.screenContent.mainContent;
      view.footer.innerHTML = view.screenContent.footerContent;
    },

    renderUpComing: (whichScreen) => {
      // if (!document.querySelector(`section[class="${whichScreen} go-offscreen"]`)){ // TODO: remove this if
        const piece = document.createDocumentFragment();
        const section = document.createElement('section');
        section.innerHTML = `<header class="header">${view.screenContent.headerContent}</header>
                              <main class="main filter-div">${view.screenContent.mainContent}</main>
                              <footer class="footer">${view.screenContent.footerContent}</footer>`;

        piece.appendChild(section);
        document.body.appendChild(piece);
        section.className = whichScreen;
        section.classList.add('go-active');

      // }
      // else {
      //   view.handleScreens(section);
      //
      //   const section = document.querySelector(`.${whichScreen}`);
      // }
    }
  },

  fillNeighborhoodsHTML: (neighborhoods = model.neighborhoods) => {
    console.log(neighborhoods);
    const select = document.getElementById('neighborhoods-select');
    neighborhoods.forEach(neighborhood => {
      const option = document.createElement('option');
      option.innerHTML = neighborhood;
      option.value = neighborhood;
      select.append(option);
    });
  },

  fillCuisinesHTML: (cuisines = model.cuisines) => {
    const select = document.getElementById('cuisines-select');

    cuisines.forEach(cuisine => {
      const option = document.createElement('option');
      option.innerHTML = cuisine;
      option.value = cuisine;
      select.append(option);
    });
  },

  createRestaurantHTML: (restaurant) => {
    const li = document.createElement('li');

    const image = document.createElement('img');
    image.className = 'restaurant-img';
    image.src = DBHelper.imageUrlForRestaurant(restaurant);
    li.append(image);

    const name = document.createElement('h1');
    name.innerHTML = restaurant.name;
    li.append(name);

    const ratingDiv = document.createElement('div');
    const rating = new Rating(restaurant);
    rating.defineStars();
    ratingDiv.innerHTML = `<span> ${rating.points}</span><span> ${rating.stars}</span><span>(${rating.reviewsNumber})</span>`;
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
    li.append(more)

    return li;
  },

  handleScreens: (toggledScreen) => {
    toggledScreen.classList.toggle('go-active');
    toggledScreen.classList.toggle('go-offscreen');
  }
}


/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {

  view.homeScreen.init();



});

const octopus = {
  fetchNeighborhoods:  () => {
    DBHelper.fetchNeighborhoods((error, neighborhoods) => {
      if (error) { // Got an error
        console.error(error);
      } else {
        console.log('neigth');
        model.neighborhoods = neighborhoods;
        console.log(model.neighborhoods);
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
      marker.addEventListener("click", onClick);
      function onClick() {
        console.log('marker click');
        window.location.href = marker.options.url;
      }
      self.markers.push(marker);
    });
  },

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
          console.log(model.restaurants);
          const ul = document.getElementById('restaurants-list');
          if (ul){
            octopus.resetRestaurants(model.restaurants);
          }
          octopus.addMarkersToMap(model.restaurants);
          resolve();
        }
      });
    });

  },

  resetRestaurants: (restaurants) => {
    // Remove all restaurants
    model.restaurants = [];
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';

    // Remove all map markers
    if (self.markers) {
      self.markers.forEach(marker => marker.remove());
    }
    self.markers = [];
    model.restaurants = restaurants;
  }
}

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
