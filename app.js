// Referències a elements del DOM
const matchForm = document.getElementById('match-form');
const matchesDiv = document.getElementById('matches');
const yourWins = document.getElementById('your-wins');
const yourLosses = document.getElementById('your-losses');
const eliaWins = document.getElementById('elia-wins');
const eliaLosses = document.getElementById('elia-losses');
const toggleFormBtn = document.getElementById('toggle-form-btn');
const addMatchSection = document.querySelector('.add-match');

// Funció per alternar la visibilitat del formulari
toggleFormBtn.addEventListener('click', () => {
    addMatchSection.classList.toggle('hidden');
    if (addMatchSection.classList.contains('hidden')) {
        toggleFormBtn.textContent = 'Afegir Partit';
    } else {
        toggleFormBtn.textContent = 'Tancar Formulari';
    }
});

// Funció per afegir un partit
matchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const winner = document.getElementById('winner').value;
    const sets = document.getElementById('sets').value;
    const comment = document.getElementById('comment').value;

    if (winner === "") {
        alert("Debes seleccionar un ganador o empate.");
        return;
    }

    db.collection('matches').add({
        winner,
        sets,
        comment,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        matchForm.reset(); 
        addMatchSection.classList.add('hidden'); 
        toggleFormBtn.textContent = 'Añadir Partido'; 
    }).catch(error => {
        console.error("Error al añadir el partido: ", error);
    });
});



// Función para renderizar partidos
db.collection('matches').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
    matchesDiv.innerHTML = '';
    let yourWinCount = 0;
    let yourLossCount = 0;
    let eliaWinCount = 0;
    let eliaLossCount = 0;

    snapshot.forEach(doc => {
        const match = doc.data();
        const matchId = doc.id;
        const matchDiv = document.createElement('div');
        matchDiv.classList.add('match');

        const winner = match.winner;
        const sets = match.sets;
        const comment = match.comment;

        let loser = "";
        if (winner === "Jana") {
            yourWinCount++;
            loser = "Èlia";
            eliaLossCount++;
        } else if (winner === "Èlia") {
            eliaWinCount++;
            loser = "Jana";
            yourLossCount++;
        } else if (winner === "Empate") {
            // No se cuentan como victoria o derrota
        }
        
        matchDiv.innerHTML = `
            <div class="match-details">
                <h3>
                    ${winner !== "Empat" ? winner : 'Empate'}
                    ${winner !== "Empat" ? `
                        <svg class="winner-crown" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path opacity="0.15" d="M4 16V5L8 9L12 5L16 9L20 5V16H4Z" fill="currentColor"/>
                            <path d="M4 19H20M4 5V16H20V5L16 9L12 5L8 9L4 5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    ` : ''}
                </h3>
                ${winner !== "Empat" ? `<p><span class="label">Perdedora:</span> ${loser}</p>` : ''}
                <p><span class="label">Sets:</span> ${sets}</p>
                ${comment ? `<p><span class="label">Comentari:</span> ${comment}</p>` : ''}
            </div>
            <button class="delete-btn" data-id="${matchId}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M3 6h18v2H3zm3 3h12v12H6zm5-5h2v3h-2z"></path>
                </svg>
            </button>
        `;
    

        matchesDiv.appendChild(matchDiv);
    });

    yourWins.textContent = yourWinCount;
    yourLosses.textContent = yourLossCount;
    eliaWins.textContent = eliaWinCount;
    eliaLosses.textContent = eliaLossCount;

    // Añadir eventos para los botones de borrar
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', () => {
            const matchId = button.getAttribute('data-id');
            if (confirm("¿Estás seguro de que quieres borrar este partido?")) {
                db.collection('matches').doc(matchId).delete()
                .then(() => {
                    console.log("Partido borrado exitosamente.");
                })
                .catch(error => {
                    console.error("Error al borrar el partido: ", error);
                });
            }
        });
    });
});
