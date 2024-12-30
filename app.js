
// Referencias a elementos del DOM
const matchForm = document.getElementById('match-form');
const matchesDiv = document.getElementById('matches');
const yourWins = document.getElementById('your-wins');
const yourLosses = document.getElementById('your-losses');
const eliaWins = document.getElementById('elia-wins');
const eliaLosses = document.getElementById('elia-losses');
const toggleFormBtn = document.getElementById('toggle-form-btn');
const addMatchSection = document.querySelector('.add-match');

// Función para alternar la visibilidad del formulario
toggleFormBtn.addEventListener('click', () => {
    addMatchSection.classList.toggle('hidden');
    if (addMatchSection.classList.contains('hidden')) {
        toggleFormBtn.textContent = 'Añadir Partido';
    } else {
        toggleFormBtn.textContent = 'Cerrar Formulario';
    }
});

// Función para añadir un partido
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
        if (winner === "Tú") {
            yourWinCount++;
            loser = "Èlia";
            eliaLossCount++;
        } else if (winner === "Èlia") {
            eliaWinCount++;
            loser = "Tú";
            yourLossCount++;
        } else if (winner === "Empate") {
            // No se cuentan como victoria o derrota
        }

        matchDiv.innerHTML = `
            <div class="match-details">
                <h3>Ganador: ${winner}</h3>
                ${winner !== "Empate" ? `<p>Perdedor: ${loser}</p>` : ''}
                <p>Sets: ${sets}</p>
                ${comment ? `<p>Comentario: ${comment}</p>` : ''}
            </div>
            <button class="delete-btn" data-id="${matchId}">Borrar</button>
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
