/**
 * April 25, 2020
 * Copyright, Mikhail K., 2020
 */

const database = 'deddb.json';
const useDb = true;

function loadJSON(path, success, error) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if(xhr.readyState === XMLHttpRequest.DONE) {
            if(xhr.status === 200) {
                if(success) {
                    success(JSON.parse(xhr.responseText));
                }
            } else {
                if(error) {
                    error(xhr);
                }
            }
        }
    };
    xhr.open('GET', path, true);
    xhr.send();
}

function loadDatabase() {
    let container = document.getElementById('container');
    container.innerHTML = 'Загрузка базы данных, пожалуйста, подождите...';
    loadJSON(database, (data) => {
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
                    '   <div class="portrait">' +
                    '    <img src="portraits/' + name + '.png"  alt="' + name + ' ' + lived +'"/>' +
                    '    <p class="name">' + name + '<span>' + lived + '</span></p>' +
                    '    <a class="more-button">Подробнее</a></div>' + (text === undefined ? "" :
                    '   <div class="pd">' +
                    '    ' + text +
                    '   <br><br><a class="more-button">Подробнее</a></div>') +
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

let smooth = 0;
let lastDelta = 0;
let scrollAcceleration = 0;
let slideTimer;

const scrollLeftAnimation = () => {
    scrollCarousel(0);
};
const scrollRightAnimation = () => {
    scrollCarousel($('#container').width()*2.6);
};
let lastScrollWidth = 0;

function scrollCarousel(width) {
    lastScrollWidth = width;
    let container = $('#container');
    if(container.is(':animated')) {
        return;
    }
    container.animate({
        scrollLeft: width,
    }, 24000, () => {
        if(width === 0) {
            scrollRightAnimation();
        } else {
            scrollLeftAnimation();
        }
    });
}

function initializeApp() {
    document.getElementById('smooth-scroll').addEventListener('change', (e) => {
        if(e.target.checked) {
            smooth = 1;
        }
    });
    document.getElementById('smooth-scroll-2').addEventListener('change', (e) => {
        if(e.target.checked) {
            smooth = 2;
        }
    });
    let container = document.getElementById('container');
    let scroll = (e) => {
        if(location.hash === '#more') {
            return;
        }
        let delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        if(slideTimer !== undefined) {
            if(((delta > 0 && lastDelta > 0) || (delta < 0 && lastDelta < 0)) && scrollAcceleration < 50) {
                scrollAcceleration += 5;
                return;
            } else {
                window.clearInterval(slideTimer);
            }
        }
        if(smooth === 2) {
            lastDelta = delta;
            slideTimer = setInterval(() => {
                let x = delta*(scrollAcceleration > 0 ? scrollAcceleration : 0);
                document.getElementById('techinf').innerHTML = ' scroll: ' + x + '; acceleration: ' + (scrollAcceleration > 0 ? scrollAcceleration : 0) + '; ScrollLeft: ' + container.scrollLeft + '; ScrollWidth: ' + container.scrollWidth;
                container.scrollLeft -= x;
                scrollAcceleration -= 0.6;
                if(scrollAcceleration < 0.75) {
                    window.clearInterval(slideTimer);
                    slideTimer = undefined;
                }
            }, 15);
        } else if(smooth === 1) {
            let scrollAmount = 0;
            slideTimer = setInterval(function(){
                container.scrollLeft -= delta*10;
                scrollAmount -= delta*10;
                if(scrollAmount >= 100){
                    window.clearInterval(slideTimer);
                }
            }, 25);
        } else {
            container.scrollLeft -= (delta * 50);
        }
    };
    if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
        document.addEventListener('DOMMouseScroll', scroll, false);
    } else {
        document.addEventListener('mousewheel', scroll, false);
    }
}

function test() {
    let container = document.getElementById('container');
    container.scrollLeft = 0;
}

function parseDed() {
    document.querySelectorAll('.more-button').forEach((btn) => {
        btn.addEventListener('click', () => {
            (function () {
                showInfo(btn.parentElement.parentElement);
            })()
        });
    });
    if($('#desktop-view').css('display') !== 'none') {
        console.log('Started carousel');
        $('.ded-wrapper').hover(() => {
            $(container).stop();
        }, () => {
            scrollCarousel(lastScrollWidth);
        });
        scrollRightAnimation();
    }
    /*document.querySelectorAll('.ded > img').forEach((img) => {
        img.addEventListener('click', () => {
            (function () {
                if(img.parentElement.matches(':hover')) {
                    showInfo(img.parentElement);
                }
            })()
        });
    });*/
}

window.onload = () => {
    if(useDb) {
        loadDatabase();
    } else {
        parseDed();
    }
    initializeApp();
};