var flashcards = [],
    deckMemory = [];

class FlashCard {
    constructor(front, back) {
        this.front = front;
        this.back = back
    }
}

function createCard() {
    const front = $("#front").val();
    const back = $("#back").val();
    let card = new FlashCard(front, back);
    flashcards.push(card);
    return card
}

function printCard(card) {
    const front = card.front;
    const back = card.back;
    let html = `<div class="printed-card"><p>${front}</p><p><strong>${back}</strong></p></div>`;
    $("#printout").prepend(html)
}

function resetForm() {
    $("#front, #back").val("");
    $("#front").focus();
}

function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array
}

function playSet(deck) {
    $(".top-container, .main-container").css("display", "none");
    $(".play-container").css("display", "flex");
    nextCard(deck)
}

function flipCard() {
    if ($("#flashcard-text-back").is(":hidden")) {
        $(".flashcard").hide(50).show(80);
        $("#flashcard-text-back").show(50);
        $("#flashcard-text-front, .flashcard-subtitle").css("display", "none")
    } else {
        $(".flashcard").hide(50).show(80);
        $("#flashcard-text-back").css("display", "none");
        $("#flashcard-text-front, .flashcard-subtitle").show(50)
    }
}

function nextCard(deck) {
    let front = deck[0].front;
    let back = deck[0].back;
    $("#flashcard-text-back").text(back).css("display", "none");
    $("#flashcard-text-front").text(front).show();
    $(".flashcard-subtitle").show();
    deckMemory.push(deck[0]);
    deck.splice(0, 1);
}

function advanceCount(counter, total) {
    let text = `${counter} of ${total}`;
    $(".flashcard-subtitle").text(text)
}

function createAddCard() {
    const front = $("#add-front").val();
    const back = $("#add-back").val();
    let card = new FlashCard(front, back);
    flashcards.push(card);
    return card
}

function resetAddForm() {
    $("#add-front, #add-back").val("");
    $("#add-front").focus();
}

$("#flashcard-form").on('submit', () => {
    let card = createCard();
    printCard(card);
    resetForm();
    if ($("#export-json").is(":hidden")) {
        $("#export-json").css("display", "inline")
    }
    if ($(".add-container").is(":visible")) {
        $(".add-container, .import-container").css("display", "none")
    }
})

$("#export-json").on('click', () => {
    let title = $("#title").val(),
        name = `${title}.json`;
    let blob = new Blob([JSON.stringify(flashcards)], {
            type : 'application/json',
        });
    saveAs(blob, name)
})

$("#file-select").on('change', (e) => {
    var jsonFile = e.target.files[0];
    var reader = new FileReader();
    reader.onload = (e) => {
        let contents = e.target.result;
        let deck = JSON.parse(contents);
        var [...shuffledDeck] = shuffle(deck);
        playSet(shuffledDeck);

        const total = deck.length;
        var counter = 1;
        advanceCount(counter, total);

        $(window).on('keydown', (e) => {
            if (e.keyCode === 32) {
                flipCard()
            } else if (e.keyCode === 74) {
                if (shuffledDeck.length > 0) {
                    nextCard(shuffledDeck);
                    counter += 1;
                    advanceCount(counter, total)
                } else {
                    if (confirm("Great job! Deck complete. Play again?")) {
                        shuffledDeck = shuffle(deckMemory);
                        deckMemory = [];
                        nextCard(shuffledDeck);
                        counter = 1;
                        advanceCount(counter, total)
                    } else {
                        location.reload()
                    }
                }
            }
        }) 
    };
    reader.readAsText(jsonFile);   
})

$("#add-deck-select").on('change', (e) => {
    let name = e.target.files[0].name;
    name = name.slice(0, -5);
    $("#title-added").val(name);

    var jsonFile = e.target.files[0];
    var reader = new FileReader();
    reader.onload = (e) => {
        let contents = e.target.result;
        flashcards = JSON.parse(contents);
        console.log(flashcards);
        let html = flashcards.reduce((acc, card) => {
            let snippet = `<div class="printed-card"><p>${card.front}</p><p><strong>${card.back}</strong></p></div>`;
            acc += snippet;
            return acc
        }, "");
        $("#printout").html(html);
        $(".new-deck-container, .import-container").hide();
        $("#add-card-form").show();
        $("#add-front").focus();
    }
    reader.readAsText(jsonFile);   
})

$("#add-card-form").on('submit', () => {
    let card = createAddCard();
    printCard(card);
    resetAddForm();
    if ($("#export-added-json").is(":hidden")) {
        $("#export-added-json").css("display", "inline")
    }
})

$("#export-added-json").on('click', () => {
    let title = $("#title-added").val(),
        name = `${title}.json`;
    let blob = new Blob([JSON.stringify(flashcards)], {
            type : 'application/json',
        });
    saveAs(blob, name)
})