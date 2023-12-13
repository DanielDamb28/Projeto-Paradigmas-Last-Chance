self.onmessage = function (e) {
    const buffer = e.data.buffer;
    const view = new Uint8Array(buffer);
    let pageInicial = e.data.pagInicial;
    let pageFinal = e.data.pagFinal;
    let posicaoBuffer = e.data.index;
    for (let i = pageInicial; i <= pageFinal; i++) {
        fetchPagPorNum(i, posicaoBuffer, view)
        posicaoBuffer = posicaoBuffer + 40000
    }
};

function fetchPagPorNum(page, posicaoBuffer, view) {
    const url = "https://api.themoviedb.org/3/discover/movie?api_key=cfdd431aa71175eab089ab96641cd816&include_adult=false&include_video=false&language=en-US&sort_by=popularity.desc&page=" + page;
    const enc = new TextEncoder();
    let contador = posicaoBuffer
    fetch(url)
        .then(response => response.json())
        .then(data => {
            data.results.forEach(element => {
                let id = element.id
                let title = element.title
                let overview = element.overview
                title = title.replace(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g, '')
                overview = overview.replace(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g, '')
                string = id + "&" + title + " # " + overview + '!'
                let encoded = enc.encode(string);
                encoded.forEach((element, i) =>
                    view[i + contador] = element
                );
                contador = contador + 2000
            });
        })
        .catch(error => {
            self.postMessage({ error: error.message });
        });
}

