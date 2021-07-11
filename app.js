'use strict';

const characters = document.querySelector('#characters');
const comicsCards = document.querySelector('#comicsCards');
const card = document.querySelectorAll('.card');
const comics = document.getElementById('comics');
const modalInfo = document.getElementById('modal');
const info = document.getElementById('infoModal');
const picModal = document.getElementById('pictures');
const modalMisc = document.getElementById('modalMisc');
const arrow = document.querySelector('.arrow');
const cardTitle = document.querySelector('.card-title');
const comicPic = document.querySelector('.card-img');
const title = document.querySelector('#title');
const searchInput = document.querySelector('.search-input');
const form = document.querySelector('.search-form');
const btn = document.querySelector('.btn-search');
const spinner = document.querySelector('.spinner');
const cardBtn = document.getElementsByClassName('card-btn');
let url;
let url2;
let hero;
let currentSearch;
let selected;
let output;
let findComic;

//* Event Listeners */
window.addEventListener('load', () => {
  getHero('rocket raccoon');
});

searchInput.addEventListener('input', updateSearch);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  currentSearch = hero;
  getHero(hero);
});

//*Functions */

function updateSearch(e) {
  hero = e.target.value;
}

function showSpinner() {
  spinner.style.display = 'block';
}

function hideSpinner() {
  spinner.style.display = 'none';
}

async function fetchApi(url) {
  const dataFetch = await fetch(url, {
    method: 'GET',
    params: {
      apikey: PUBLIC_KEY,
      ts: ts,
      hash: hash,
    },
    headers: {
      Accept: 'application/json',
    },
  });

  const data = await dataFetch.json();
  return data;
}

//RENDERING

function renderHeros(data) {
  const html = data.data.results
    .map((result) => {
      return ` 
      <div class="card">
        <img src="${result.thumbnail.path}/standard_incredible.jpg" class="card-img-top" alt="">
        <div class="card-body">
          <h5 class="card-title">${result.name}</h5>
          <p class="card-text">${result.description}</p>
          <p class="card-text"><small class="text-muted">Comics: ${result.comics.available} | Stories: ${result.stories.available} | Series: ${result.series.available} | Events: ${result.events.available} | </small></p>
        </div>
      </div>`;
    })
    .join('');
  characters.insertAdjacentHTML('afterbegin', html);
}

function renderComics(data) {
  let output = `
   <h2>Comics</h2>
  `;
  title.insertAdjacentHTML('afterbegin', output);

  const html = data.data.results
    .map((result) => {
      if (!`${result.thumbnail.path}`.match(/image_not_available/)) {
        return `
      <div class="col-xs-2 col-md-4 col-lg-3 card-main">
        <div class="card bg-dark text-white" >
          <img src="${result.thumbnail.path}/portrait_incredible.jpg" class="card-img comic-pic" alt="..." data-toggle="modal" data-target="#exampleModal">
          <div class="card-img-overlay d-flex overlay">
          <p class="card-text hide price">Price: $${result.prices[0].price}</p>
          <button href="" class="card-btn hide" data-toggle="modal" data-target="#exampleModal" data-id="${result.id}">View Details</button>
      </div>
        </div>
      </div>
      `;
      }
    })
    .join('');
  comicsCards.insertAdjacentHTML('afterbegin', html);
}

const comicError = function () {
  let output = `
  <h2>Comics</h2>
 `;
  title.insertAdjacentHTML('afterbegin', output);

  let output2 = `
  <p class="text-center"> No Comics available for this character. </p>
  `;
  comicsCards.innerHTML = output2;
};

const renderError = function (msg) {
  characters.innerHTML = `
    <h3 class="error">Error: ${msg}.</h3>
  `;
};

//FETCHING

async function getHero(hero) {
  try {
    clear();

    //Getting Heros
    url = `https://gateway.marvel.com/v1/public/characters?name=${hero}&ts=${ts}&apikey=${PUBLIC_KEY}&hash=${hash}`;
    showSpinner();
    const data = await fetchApi(url);

    if (data.data.count === 0) {
      hideSpinner();
      throw new Error(` '${hero}' not found. <br> Please try again`);
    } else if (data === undefined || data.length === 0) {
      hideSpinner();
      throw new Error(`An error occured. Try again later.`);
    } else {
      renderHeros(data);
      hideSpinner();
    }

    setTimeout(function () {
      arrow.style.opacity = 1;
    }, 1000);

    //Getting Comics

    const characterId = `${data.data.results[0].id}`;

    url2 = `https://gateway.marvel.com/v1/public/characters/${characterId}/comics?&ts=${ts}&apikey=${PUBLIC_KEY}&hash=${hash}`;
    const data2 = await fetchApi(url2);

    if (data2.data.count === 0) {
      comicError();
    } else {
      renderComics(data2);

      //Populate Modal
      const marvel = data2.data.results;

      Array.from(cardBtn).forEach((card) => {
        card.addEventListener('click', (e) => {
          selected = e.target.dataset.id;
        });
      });

      Array.from(cardBtn).forEach((card) => {
        card.addEventListener('click', () => {
          findComic = marvel.find((comic) => {
            return `${comic.id}` === selected;
          });
          console.log(findComic);

          let outputModal = '';
          let pics = '';

          pics += `
          <img src="${findComic.thumbnail.path}/portrait_incredible.jpg" alt="" class="modal-pic">
          `;
          picModal.innerHTML = pics;

          if (findComic.description !== null) {
            outputModal += `
            <h5 class="modal-title text-center" id="exampleModalLabel">${findComic.title}</h5>
            <p style="text-align:justify;">${findComic.description}</p>
            `;
            info.innerHTML = outputModal;
          } else {
            outputModal += `
            <h5 class="modal-title text-center" id="exampleModalLabel">${findComic.title}</h5>
            <p class="text-center" style="font-style:italic;">Description not available</p>
            `;
            info.innerHTML = outputModal;
          }

          if (findComic.characters.items !== 0) {
            outputModal += `
            <p style="margin-top: 20px;"> <strong>Characters: </strong>
            ${findComic.characters.items.map((item) => {
              return `${item.name}`;
            })} </p> `;

            info.innerHTML = outputModal;
          }

          if (findComic.creators.items !== 0) {
            outputModal += `<p style="margin-top: 20px;"> <strong>Creators: </strong>${findComic.creators.items.map(
              (item) => {
                return `${item.name}`;
              }
            )}</p>
                                               
          `;
            info.innerHTML = outputModal;
          }
        });
      });
    }
  } catch (err) {
    console.error(`${err.message}`);
    renderError(`${err.message}`);
  }
}

function clear() {
  characters.innerHTML = '';
  searchInput.innerHTML = '';
  comicsCards.innerHTML = '';
  arrow.style.opacity = 0;
  title.innerHTML = '';
}
