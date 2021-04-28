/**
 * April 25, 2020
 * Copyright, Mikhail K., 2020
 */

const database = 'deddb.json';
const useDb = true;

let container;

function loadDatabase() {
  container.innerHTML = 'Загрузка базы данных, пожалуйста, подождите...';
  $.getJSON(database, (data) => {
    container.innerHTML = '';
    let gallery = [];
    data.ded.forEach((ded) => {
      let name = ded.name;
      let lived = ded.lived;
      let text = ded.text;
      let full = ded.full;
      if(full === undefined) {
        full = text;
      }
      gallery.push({name: name, value:
          '<div class="ded-wrapper">' +
          ' <div class="ded" data-name="' + name + '" data-lived="' + ded.lived + '" data-full="' + full + '">' +
          '  <div class="portrait">' +
          '  <img src="portraits/' + name + '.png" onerror="portraitError(this)" alt="' + name + ' ' + lived +'"/>' +
          '  <p class="name">' + name + '<span>' + lived + '</span></p>' +
          '  <a class="more-button">Подробнее</a></div>' + (text === undefined ? "" :
          '  <div class="pd">' +
          '  ' + text +
          '  <br><br><a class="more-button">Подробнее</a></div>') +
          ' </div>' +
          '</div>'});
    });
    gallery.sort(function(a, b){
      if(a.name < b.name) { return -1; }
      if(a.name > b.name) { return 1; }
      return 0;
    });
    gallery.forEach((entry) => {
      container.innerHTML += entry.value;
    });
    parseDed();
  }, (error) => {
    document.body.innerHTML = 'База данных недоступна: ' + error;
  });
}

function showInfo(ded) {
  document.getElementById('more-portrait').src = 'portraits/' + ded.dataset.name + '.png';
  document.getElementById('more-name').innerHTML = ded.dataset.name;
  document.getElementById('more-lived').innerHTML = '(' + ded.dataset.lived + ')';
  document.getElementById('more-text').innerHTML = ded.dataset.full;
  location.href = '#more';
  document.getElementById('more-wrapper').scrollIntoView();
}

function getMaxScroll(element) {
  return element.scrollWidth - element.clientWidth
}

let lastDelta = 0;
let scrollAcceleration = 0;
let slideTimer;

let carouselDirection = -1;

function scrollCarousel() {
  let width;
  let current = Math.ceil(container.scrollLeft);
  let max = Math.ceil(getMaxScroll(container));
  if(current === max) {
    width = 0;
  } else if(current === 0) {
    width = max;
  } else {
    width = carouselDirection === -1 ? max : carouselDirection;
  }
  carouselDirection = width;
  let jcontainer = $('#container');
  if(jcontainer.is(':animated')) {
    return;
  }
  jcontainer.animate({
    scrollLeft: width,
  }, 32000, () => {
    scrollCarousel();
  });
}

function initializeApp() {
  let scroll = (e) => {
    if(location.hash === '#more') {
      return;
    }
    let delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    if(slideTimer !== undefined) {
      if(((delta > 0 && lastDelta > 0) || (delta < 0 && lastDelta < 0)) && scrollAcceleration < 28) {
        let amplifier = scrollAcceleration/2.5;
        scrollAcceleration += (scrollAcceleration + amplifier > 25 ? 10 : amplifier);
        return;
      } else {
        window.clearInterval(slideTimer);
      }
    }
    scrollAcceleration = 15;
    lastDelta = delta;
    slideTimer = setInterval(() => {
      let x = delta*(scrollAcceleration > 0 ? scrollAcceleration : 0);
      container.scrollLeft -= x;
      scrollAcceleration -= 0.6;
      if(scrollAcceleration < 0.75 || container.scrollLeft >= getMaxScroll(container) || container.scrollLeft === 0) {
        window.clearInterval(slideTimer);
        slideTimer = undefined;
      }
    }, 15);
  };
  if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
    document.addEventListener('DOMMouseScroll', scroll, false);
  } else {
    document.addEventListener('mousewheel', scroll, false);
  }
}

function parseDed() {
  document.querySelectorAll('.more-button').forEach((btn) => {
    btn.addEventListener('click', () => {
      (function () {
        showInfo(btn.parentElement.parentElement);
      })()
    });
  });
  let audio = document.getElementById('music');
  if($('#desktop-view').css('display') !== 'none') {
    $('#container, .ded-wrapper, .modal-overlay').hover(() => {
      $(container).stop();
    }, () => {
      scrollCarousel();
    });
    scrollCarousel();
    document.querySelectorAll('.ded > .portrait > img').forEach((img) => {
      img.addEventListener('click', () => {
        (function () {
          if (img.parentElement.matches(':hover')) {
            showInfo(img.parentElement.parentElement);
          }
        })()
      });
    });
    document.body.addEventListener('click', () => {
      if(audio.paused) {
        audio.play();
      }
    });
    document.body.click();
    setTimeout(() => {
      audio.play();
    }, 5000);
  } else {
    audio.remove();
  }
}

function portraitError(portrait) {
  portrait.src = 'images/default.png';
}

window.onload = () => {
  location.hash = '';
  container = document.getElementById('container');
  if(useDb) {
    loadDatabase();
  } else {
    parseDed();
  }
  initializeApp();
};