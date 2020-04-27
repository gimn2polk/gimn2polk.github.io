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
    container.innerHTML = 'Загрузка...';
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
                    '   <img src="portraits/' + name + '.png"  alt="' + name + ' ' + lived +'"/>' +
                    '   <p class="name">' + name + '<span>' + lived + '</span></p>' + (text === undefined ? "" :
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
        document.body.innerHTML = 'Ошибка при подключении к базе данных: ' + error;
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

function parseDed() {
    document.querySelectorAll('.ded > .pd > .more-button').forEach((btn) => {
        btn.addEventListener('click', () => {
            (function () {
                showInfo(btn.parentElement.parentElement);
            })()
        });
    });
    document.querySelectorAll('.ded > img').forEach((img) => {
        img.addEventListener('click', () => {
            (function () {
                showInfo(img.parentElement);
            })()
        });
    });
}

window.onload = () => {
    if(useDb) {
        loadDatabase();
    } else {
        parseDed();
    }
};