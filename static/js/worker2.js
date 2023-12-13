self.onmessage = function (e) {
    const buffer1 = e.data.bufferFilmes;
    const view1 = new Uint8Array(buffer1);
    const buffer2 = e.data.bufferResultados;
    const view2 = new Uint8Array(buffer2);

    let arrayResultados = []
    let pageInicial = e.data.pagInicial;
    let pageFinal = e.data.pagFinal;
    let posicaoBuffer = e.data.index;
    let filmes = e.data.filmesSelecionados;
    let keys = []
    filmes.forEach(element => {
        if (element.id != undefined)
            keys.push(element.id)
    })
    let posicaoResultados = e.data.indexResultados

    for (let i = pageInicial; i <= pageFinal; i++) {
        let info = buscaInformacoesDoBuffer(posicaoBuffer, view1, posicaoBuffer)
        fazerCalculosDeDistanciaEuclidiana(filmes, arrayResultados, info, keys)

        posicaoBuffer = posicaoBuffer + 40000
    }
    const compararPorResultado = (a, b) => a.result - b.result;
    const dataOrdenado = arrayResultados.sort(compararPorResultado);
    passarResultadosDoArrayParaOSharedBuffer(dataOrdenado, view2, posicaoResultados)

};

function buscaInformacoesDoBuffer(posicaoBuffer, view, posicaoBuffer) {
    let array = []
    posicao = posicaoBuffer
    for (i = 0; i < 20; i++) {
        viewHere = view.slice(posicao, posicao + 1999);

        const specialChar = '!'.charCodeAt(0);
        const specialCharIndex = Array.from(viewHere).indexOf(specialChar);

        const dec = new TextDecoder();
        decoded = viewHere.slice(0, specialCharIndex)
        let string = dec.decode(decoded);

        const idChar = '&'.charCodeAt(0);
        const idIndex = Array.from(viewHere).indexOf(idChar);
        id = string.slice(0, idIndex)
        string = string.slice(idIndex + 1)

        const titleChar = '#'.charCodeAt(0);
        let titleIndex = (Array.from(viewHere).indexOf(titleChar)) - idIndex - 1;

        title = string.slice(0, titleIndex)
        overview = string.slice(titleIndex + 1)

        const data = {
            filmeId: id,
            filmeTitle: title,
            filmeOverview: overview,
        }
        array.push(data);
        posicao += 2000
    }
    return array
}

function fazerCalculosDeDistanciaEuclidiana(filmesSelecionados, array, info, keys) {
    filmes = ""
    filmesSelecionados.forEach(element => {
        filmes += element.title + " " + element.overview
    })
    filmes = tratarSentenca(filmes)
    filmes = createBagOfWords(filmes)
    info.forEach((element) => {
        text = element.filmeTitle + " " + element.filmeOverview
        if (text.length > 50 && !keys.includes(parseInt(element.filmeId, 10))) {
            text = tratarSentenca(text)
            text = createBagOfWords(text)
            resultado = distanciaEuclidiana(text, filmes)
            data = {
                id: element.filmeId,
                titulo: element.filmeTitle,
                result: resultado,
            }
            array.push(data)
        }
    })
}

function tratarSentenca(sentence) {
    sentence = sentence.replace(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g, '')
    sentence = retiraStopWords(sentence)
    setence = sentence.replace(/\s{2,}/g, " ")
    return setence
}

function retiraStopWords(sentence) {
    const stopWords = ["#", "de", "a", "o", "que", "e", "do", "da", "em", "um", "para", "é", "com", "não", "uma", "os", "no", "se", "na", "por", "mais", "as", "dos", "como", "mas", "ao", "ele", "das", "à", "seu", "sua", "ou", "quando", "muito", "nos", "já", "eu", "também", "só", "pelo", "pela", "até", "isso", "ela", "entre", "depois", "sem", "mesmo", "aos", "seus", "quem", "nas", "me", "esse", "eles", "você", "essa", "num", "nem", "suas", "meu", "às", "minha", "numa", "pelos", "elas", "qual", "nós", "lhe", "deles", "essas", "esses", "pelas", "este", "dele", "tu", "te", "vocês", "vos", "lhes", "meus", "minhas", "teu", "tua", "teus", "tuas", "nosso", "nossa", "nossos", "nossas", "dela", "delas", "esta", "estes", "estas", "aquele", "aquela", "aqueles", "aquelas", "isto", "aquilo", "estou", "está", "estamos", "estão", "estive", "esteve", "estivemos", "estiveram", "estava", "estávamos", "estavam", "estivera", "estivéramos", "esteja", "estejamos", "estejam", "estivesse", "estivéssemos", "estivessem", "estiver", "estivermos", "estiverem", "hei", "há", "havemos", "hão", "houve", "houvemos", "houveram", "houvera", "houvéramos", "haja", "hajamos", "hajam", "houvesse", "houvéssemos", "houvessem", "houver", "houvermos", "houverem", "houverei", "houverá", "houveremos", "houverão", "houveria", "houveríamos", "houveriam", "sou", "somos", "são", "era", "éramos", "eram", "fui", "foi", "fomos", "foram", "fora", "fôramos", "seja", "sejamos", "sejam", "fosse", "fôssemos", "fossem", "for", "formos", "forem", "serei", "será", "seremos", "serão", "seria", "seríamos", "seriam", "tenho", "tem", "temos", "tém", "tinha", "tínhamos", "tinham", "tive", "teve", "tivemos", "tiveram", "tivera", "tivéramos", "tenha", "tenhamos", "tenham", "tivesse", "tivéssemos", "tivessem", "tiver", "tivermos", "tiverem"];
    const palavras = sentence.split(/\s+/);
    const resultado = palavras.filter(palavra => !stopWords.includes(palavra.toLowerCase()));
    const sentencaSemStopWords = resultado.join(' ');

    return sentencaSemStopWords;
}

function createBagOfWords(sentence) {
    const bagOfWords = {};
    const words = sentence.toLowerCase().split(' ');
    words.forEach(word => {
        if (!bagOfWords[word]) {
            bagOfWords[word] = 0;
        }
        bagOfWords[word]++;
    });

    return bagOfWords;
}

function distanciaEuclidiana(text, filmes) {
    sum = 0
    chaves1 = Object.keys(text)
    chaves2 = Object.keys(filmes)
    set = new Set([...chaves1, ...chaves2])
    set.forEach(key => {
        const valor1 = text[key] ?? 0;
        const valor2 = filmes[key] ?? 0;
        if (valor1 === 0 || valor2 === 0) {
            sum += 5
        }
        if (valor1 > 0 && valor2 > 0) {
            sum -= 5
        }
        sum += Math.pow(valor1 - valor2, 2);
    })
    sum = Math.sqrt(sum)
    return sum
}

function passarResultadosDoArrayParaOSharedBuffer(arrayResultados, view, posicaoResultados) {
    const enc = new TextEncoder();
    for (i = 0; i < 5; i++) {

        id = arrayResultados[i].id
        title = arrayResultados[i].titulo
        result = arrayResultados[i].result
        string = id + "&" + title + "#" + result + '!'
        let encoded = enc.encode(string);
        encoded.forEach((element, i) =>
            view[i + posicaoResultados] = element
        );
        posicaoResultados += 500
    }
}