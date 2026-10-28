(function( $ ) {
"use strict";
$(document).ready( function(){

    // Form Default
    $('.form-default [data-target-letter]').on('click', function(e){
        e.preventDefault();
        const $this = $(this), 
            $form = $this.parents('.form-default'),
            $inputHidden = $form.find('[type="hidden"]'),
            $letterVal = $this.data('target-letter');

        $form.find('[type="text"], [type="hidden"]').val( $inputHidden.val() + $letterVal );
    });

    $('.btn-backspace').on('click', function(e){
        e.preventDefault();
        const $this = $(this), $form = $this.parents('.form-default'), $inputHidden = $form.find('[type="hidden"]');

        var $inputHiddenVal = $inputHidden.val();

        if( $inputHiddenVal.length > 0 ){
            $inputHiddenVal = $inputHiddenVal.substring(0, $inputHiddenVal.length - 1);
        }

        $form.find('[type="text"], [type="hidden"]').val( $inputHiddenVal );
    });

    // Jogo - Principal
    $('.is-game [data-target-letter]').on('click', function(e){
        e.preventDefault();
        const $this = $(this), 
            $letterVal = $this.data('target-letter').toLowerCase(),
            $data = get_fox_words();

        if( $data.lettersTotal >= 26 ){

            $('[data-target-letter]').prop('disabled', true);
            reset_fox_words_data();

        }else{

            const wordsRemoveDuplicates = the_fox_words_remove_duplicates($data.words);
            
            $data.lettersTotal++;
            $this.prop('disabled', true);

            if( wordsRemoveDuplicates.indexOf($letterVal) > -1 ){

                $data.lettersCorrect.push($letterVal);
                $this.addClass('btn-success');
                $('[data-the-letter="'+ $letterVal +'"]').addClass('active');

                if( $data.lettersCorrect.length >= wordsRemoveDuplicates.length ){
                    load_fox_words_game_success();
                }else{
                    set_fox_words(
                        $data.lettersCorrect,
                        $data.lettersWrong,
                        $data.lettersTotal,
                        $data.theme,
                        $data.words
                    );
                }


            }else{
                $data.lettersWrong.push($letterVal);
                $this.addClass('btn-danger');
                set_fox_words(
                    $data.lettersCorrect,
                    $data.lettersWrong,
                    $data.lettersTotal,
                    $data.theme,
                    $data.words
                );
            }


        }

    });

    $('[data-fox-words-status="init"], [data-fox-words-status="restart"]').on('click', function(e){
        e.preventDefault();
        reset_fox_words_data();
        window.location.href = 'index.html';
    });

    // Jogo - Modal Palpite
    $('.form-palpite').on('submit', function(e){
        e.preventDefault();
        const $form = $(this), 
            $inputText = $form.find('[type="text"]'),
            $inputHidden = $form.find('[type="hidden"]'),
            $data = get_fox_words(),
            $words = $data.words;


        const modalElement = document.getElementById('modalToThrobGame');
        const modal = bootstrap.Modal.getInstance(modalElement);

        if (modal) {
            modal.hide();
        }

        if( $inputHidden.val() === $words.join('') ){
            load_fox_words_game_success();
        }else{
            load_fox_words_game_error();
        }

        $inputText.val("");
        $inputHidden.val("");
    });

    // Escolha um tema
    $('body').on('click', '[data-target-theme]', function(e){
        e.preventDefault();
        const $this = $(this), 
            $theme = $this.data('target-theme').toLowerCase(),
            $data = get_fox_words();

        const $themes = get_fox_words_list();
        const themeSort = Math.floor(( Math.random() * $themes[$theme].words.length) + 1 );

        if( $data.theme ){

            $('[data-fox-words-status="restart-new-game"]').attr('data-fox-words-theme-slug', $theme);

            const myModal = new bootstrap.Modal('#modalContinueGame');
            myModal.show();

        }else{

            set_fox_words(
                $data.lettersCorrect,
                $data.lettersWrong,
                $data.lettersTotal,
                $themes[$theme].name,
                $themes[$theme].words[themeSort].split('')
            );

            window.location.href = 'jogo.html';
        }

    });

    $('[data-fox-words-status="restart-new-game"]').on('click', function(e){
        e.preventDefault();

        const $this = $(this), 
            $theme = $this.data('fox-words-theme-slug'),
            $themes = get_fox_words_list();

        reset_fox_words_data();

        const themeSort = Math.floor(( Math.random() * $themes[$theme].words.length) + 1 );
        const $data = get_fox_words();

        set_fox_words(
            $data.lettersCorrect,
            $data.lettersWrong,
            $data.lettersTotal,
            $themes[$theme].name,
            $themes[$theme].words[themeSort].split('')
        );

        window.location.href = 'jogo.html';
    });

    // Load
    load_fox_words_data();

} ); 
})(jQuery);

const set_fox_words = ( lettersCorrect = [], lettersWrong = [], lettersTotal = 0, theme = null, words = [] ) => {
    localStorage.setItem('fox_words_data', JSON.stringify({
        lettersCorrect: lettersCorrect,
        lettersWrong: lettersWrong,
        lettersTotal: lettersTotal,
        theme: theme,
        words: words
    }));
}

const get_fox_words = () => {
    return JSON.parse(localStorage.getItem('fox_words_data'));
}

const load_fox_words_data = () => {

    $themes = get_fox_words_list();
    $data = get_fox_words();

    if( typeof $data != undefined && $data != null ){
        
        if( $data.theme ){

            $('.letters-lenght').text($data.words.length + ' Letras');

            $.each($data.words, function(index, letter){
                $('.the-words').append('<li data-the-letter="'+ letter +'">'+ letter +'</li>');
            });

            $.each($data.lettersCorrect, function(index, value){
                $('[data-the-letter="'+ value +'"]').addClass('active');
                $('.is-game [data-target-letter="'+ value +'"]').addClass('btn-success').prop('disabled', true);
            });

            $.each($data.lettersWrong, function(index, value){
                $('.is-game [data-target-letter="'+ value +'"]').addClass('btn-danger').prop('disabled', true);
            });

            $('.the-theme').html('<strong>'+ $data.theme +'</strong>');
            $('[data-fox-words-status="continue"]').removeClass('d-none');

        }else{
            reset_fox_words_data();
        }

    }else{
        reset_fox_words_data();
    }

    

    $.each($themes, function(slug, theme){
        $('.list-themes').append(`<button type="button" class="btn btn-secondary w-100 mb-2" data-target-theme="${slug}">${theme.name}</button>`);
    });

}

const reset_fox_words_data = () => {
    set_fox_words( [], [], 0, null, [] );
}

const load_fox_words_game_success = () => {
    jQuery('.the-words').addClass('active');
    jQuery('[data-target-letter]').prop('disabled', true);
    jQuery('[data-fox-words-status="init"]').removeClass('d-none');
    jQuery('.palpitar').prop('disabled', true);
    reset_fox_words_data();
}

const load_fox_words_game_error = () => {
    jQuery('.alert-danger').removeClass('d-none');
    jQuery('[data-target-letter]:not(.btn-danger, .btn-success)').prop('disabled', true);
    setTimeout(function(){
        jQuery('.alert-danger').addClass('d-none');
        jQuery('[data-target-letter]:not(.btn-danger, .btn-success)').prop('disabled', false);
    }, 5000);
};

const the_fox_words_remove_duplicates = (arr) =>  {
    return arr.filter((item, index) => arr.indexOf(item) === index);
}

const get_fox_words_list = () => {

    var data = {
        "animais": {
            "name": "Animais",
            "words": [
                "cachorro",
                "elefante",
                "golfinho",
                "tartaruga",
                "borboleta",
                "dinossauro",
                "hipopotamo",
                "rinoceronte",
                "crocodilo",
                "canguru"
            ]
        },
        "frutas": {
            "name": "Frutas",
            "words": [
                "morango",
                "abacaxi",
                "melancia",
                "mexerica",
                "framboesa",
                "nectarina",
                "carambola",
                "jabuticaba",
                "graviola",
                "pitangueira"
            ]
        },
        "alimentos": {
            "name": "Alimentos",
            "words": [
                "macarrao",
                "biscoito",
                "panqueca",
                "almondega",
                "chocolate",
                "espaguete",
                "hamburguer",
                "gelatina",
                "manteiga",
                "requeijao"
            ]
        },
        "paises": {
            "name": "Países",
            "words": [
                "portugal",
                "argentina",
                "colombia",
                "alemanha",
                "australia",
                "venezuela",
                "indonesia",
                "dinamarca",
                "inglaterra",
                "madagascar"
            ]
        },
        "lugares": {
            "name": "Lugares",
            "words": [
                "biblioteca",
                "aeroporto",
                "restaurante",
                "farmacia",
                "prefeitura",
                "supermercado",
                "laboratorio",
                "universidade",
                "lanchonete",
                "consultorio"
            ]
        },
        "natureza": {
            "name": "Natureza",
            "words": [
                "floresta",
                "montanha",
                "cachoeira",
                "tempestade",
                "atmosfera",
                "terremoto",
                "vegetacao",
                "avalanche",
                "ecossistema",
                "biodiversidade"
            ]
        },
        "ciencias": {
            "name": "Ciências",
            "words": [
                "oxigenio",
                "bacteria",
                "molecula",
                "gravidade",
                "eletricidade",
                "fotossintese",
                "evaporacao",
                "magnetismo",
                "microscopio",
                "temperatura"
            ]
        },
        "corpo_humano": {
            "name": "Corpo Humano",
            "words": [
                "coracao",
                "pulmoes",
                "estomago",
                "esqueleto",
                "musculos",
                "cotovelo",
                "sobrancelha",
                "pescoco",
                "garganta",
                "figado"
            ]
        },
        "astronomia": {
            "name": "Espaço e Astronomia",
            "words": [
                "galaxia",
                "asteroide",
                "telescopio",
                "constelacao",
                "astronauta",
                "astronomia",
                "nebulosa",
                "meteorito",
                "satelite",
                "planetas"
            ]
        },
        "esportes": {
            "name": "Esportes",
            "words": [
                "futebol",
                "basquete",
                "natacao",
                "ciclismo",
                "ginastica",
                "handebol",
                "patinacao",
                "atletismo",
                "maratona",
                "taekwondo"
            ]
        },
        "artes_musica": {
            "name": "Artes e Música",
            "words": [
                "pintura",
                "desenho",
                "escultura",
                "violino",
                "trompete",
                "violoncelo",
                "melodia",
                "harmonia",
                "orquestra",
                "instrumento"
            ]
        },
        "filmes_series": {
            "name": "Filmes e Séries",
            "words": [
                "shrek",
                "frozen",
                "moana",
                "encanto",
                "divertidamente",
                "vingadores",
                "minecraft",
                "pokemon",
                "Zootopia",
                "wandinha",
            ]
        },
        "escola": {
            "name": "Escola e Estudos",
            "words": [
                "caderno",
                "mochila",
                "historia",
                "geografia",
                "matematica",
                "dicionario",
                "literatura",
                "experimento",
                "gramatica",
                "questionario"
            ]
        },
        "insetos": {
            "name": "Insetos e Pequenos Animais",
            "words": [
                "formiga",
                "borboleta",
                "joaninha",
                "gafanhoto",
                "libelula",
                "mariposa",
                "mosquito",
                "escorpiao",
                "centopeia",
                "caranguejo"
            ]
        },
        "tecnologia": {
            "name": "Tecnologia",
            "words": [
                "computador",
                "teclado",
                "internet",
                "aplicativo",
                "impressora",
                "programacao",
                "robotica",
                "drone",
                "inteligencia",
                "foquete"
            ]
        }
    }

    return data;
}