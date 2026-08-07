//-------- Configuration
// L'URL de l'API est servie par le serveur front (/config), jamais en dur ici.
let API_URL = "/api";

async function chargerConfig() {
  try {
    const reponse = await fetch("/config");
    if (reponse.ok) {
      const config = await reponse.json();
      API_URL = config.apiUrl || API_URL;
    }
  } catch (e) {
    console.error("config indisponible, API_URL par défaut :", API_URL);
  }
}


// ----------------------------
// Éléments HTML
// ----------------------------

const form = document.getElementById("karaoke-form");
const submitButton = document.getElementById("submit-button");

const notification = document.getElementById("notification");

const queueContainer = document.getElementById("queue-container");
const queueCount = document.getElementById("queue-count");

const nextContainer = document.getElementById("next-container");

const refreshButton = document.getElementById("refresh-button");

const apiStatus = document.getElementById("api-status");


// ------------------------------------------------------------
// Notifications
// ------------------------------------------------------------

function showNotification(message, type = "info") {
    notification.textContent = message;
    notification.className = `notification ${type}`;

    //-- Show notification (2 seconds)
    setTimeout(() => {
        notification.classList.add("hidden");
    }, 5000);
}


// ------------------------------------------------------------
// Vérification de l'API
// -----------------------------------------------------------


async function checkApiHealth() {
    try {
        const response = await fetch(`${API_URL}/sante`, {
            method: "GET"
        });

        if (!response.ok) {
            throw new Error("API indisponible");
        }

        apiStatus.textContent = "● API opérationnelle";
        apiStatus.className = "status status-online";

        submitButton.disabled = false;
        return true;

    }
    catch (error) {

        apiStatus.textContent = "● API indisponible";
        apiStatus.className = "status status-offline";

        //-- The front is working event though the api is dead
        submitButton.disabled = true;

        return false;
    }
}


// -------------------------------------------------
// Récupérer la file
// -------------------------------------------------


async function loadQueue() {
    try {
        const response = await fetch(`${API_URL}/file`);
        if (!response.ok) {
            throw new Error("Impossible de récupérer la file");
        }

        const queue = await response.json();
        displayQueue(queue);

    }
    catch (error) {
        console.error(error);

        queueContainer.innerHTML = `
            <div class="error-box">
                ⚠️ Les données de la file sont actuellement indisponibles.
                <br><br>
                Le service API ne répond pas.
            </div>
        `;
    }
}


// ============================================================
// Afficher la file
// ============================================================

function displayQueue(queue) {
    if (!Array.isArray(queue)) {
        queue = queue.file || queue.data || [];
    }

    queueCount.textContent =
        `${queue.length} personne${queue.length > 1 ? "s" : ""} dans la file`;

    if (queue.length === 0) {
        queueContainer.innerHTML = `
            <div class="empty">
                🎤 La file est vide.
                <br>
                Soyez le premier à vous inscrire !
            </div>
        `;
        return;
    }

    queueContainer.innerHTML = "";
    queue.forEach((person, index) => {
        const position = person.position || index + 1;

        const item = document.createElement("div");
        item.className = "queue-item";

        item.innerHTML = `
            <div class="position">
                ${position}
            </div>

            <div class="queue-info">

                <div class="queue-name">
                    ${escapeHtml(person.nom)}
                </div>

                <div class="queue-song">
                    🎵 ${escapeHtml(person.chanson)}
                </div>

                <div class="queue-artist">
                    ${escapeHtml(person.artiste || "Artiste inconnu")}
                </div>

            </div>

            <button
                class="pass-button"
                data-id="${person.id}"
            >
                Passer
            </button>
        `;

        queueContainer.appendChild(item);
    });

    //-- Add events to buttonn 'next'
    document.querySelectorAll(".pass-button").forEach(button => {
        button.addEventListener("click", () => {
            const id = button.dataset.id;
            passTurn(id);
        });

    });
}


// ----------------------------------------------------
// Inscription
// ---------------------------------------------------

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nom = document.getElementById("nom").value.trim();
    const chanson = document.getElementById("chanson").value.trim();
    const artiste = document.getElementById("artiste").value.trim();

    if (!nom || !chanson || !artiste) {
        showNotification(
            "Veuillez remplir tous les champs.",
            "error"
        );
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Inscription...";

    try {
        const response = await fetch(`${API_URL}/file`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nom,
                chanson,
                artiste
            })
        });

        if (!response.ok) {
            const errorData = await response.json()
                .catch(() => ({}));

            throw new Error(
                errorData.message ||
                "Impossible de rejoindre la file"
            );
        }

        const participant = await response.json();
        showNotification(
            `🎤 ${nom}, tu es bien inscrit dans la file !`,
            "success"
        );

        form.reset();

        await loadQueue();
        await loadNext();

    }
    catch (error) {
        console.error(error);
        showNotification(
            error.message || "Erreur lors de l'inscription.",
            "error"
        );

    }
    finally {

        submitButton.disabled = false;
        submitButton.textContent = "🎤 Rejoindre la file";
    }
});


// --------------------------------------------------------------
// Skip  turn
// --------------------------------------------------------------

async function passTurn(id) {
    const confirmation = confirm(
        "Voulez-vous vraiment faire passer cette personne ?"
    );

    if (!confirmation) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/file/${id}/passer`,
            {
                method: "POST"
            }
        );

        if (!response.ok) {
            throw new Error("Impossible de passer au suivant");
        }

        showNotification(
            "🎤 Le chanteur suivant est appelé !",
            "success"
        );

        await loadQueue();
        await loadNext();

    }
    catch (error) {
        console.error(error);
        showNotification(
            error.message,
            "error"
        );
    }
}


// ------------------------------------------------------------
// The 3 following 
// ------------------------------------------------------------

async function loadNext() {
    try {
        const response = await fetch(
            `${API_URL}/prochains`
        );

        if (!response.ok) {
            throw new Error("Service annexe indisponible");
        }

        const data = await response.json();
        const next = data.prochains || data;

        displayNext(next);
    }
    catch (error) {
        console.error(error);
        nextContainer.innerHTML = `
            <div class="error-box">
                🔔 Les notifications des prochains chanteurs
                sont temporairement indisponibles.
            </div>
        `;
    }
}


// ------------------------------------------------------------
// 
// ------------------------------------------------------------

function displayNext(next) {
    if (!Array.isArray(next) || next.length === 0) {
        nextContainer.innerHTML = `
            <div class="empty">
                Aucun prochain chanteur pour le moment.
            </div>
        `;
        return;
    }

    const list = document.createElement("div");
    list.className = "next-list";

    next.slice(0, 3).forEach((person, index) => {
        const item = document.createElement("div");

        item.className = "next-item";
        item.innerHTML = `
            <div class="next-position">
                ${index + 1}
            </div>

            <div class="next-name">
                ${escapeHtml(person.nom)}
            </div>

            <div class="next-song">
                🎵 ${escapeHtml(person.chanson)}
            </div>
        `;
        list.appendChild(item);
    });

    nextContainer.innerHTML = "";
    nextContainer.appendChild(list);
}


// -----------------------------------------------------------
// protect against html injection
// -----------------------------------------------------------

function escapeHtml(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// -----------------------------------------------------------
// Loading/ Refresh
// -----------------------------------------------------------

refreshButton.addEventListener("click", async () => {
    refreshButton.disabled = true;
    refreshButton.textContent = "Actualisation...";

    await checkApiHealth();
    await loadQueue();
    await loadNext();

    refreshButton.disabled = false;
    refreshButton.textContent = "↻ Actualiser";
});


// --------------------------
// Actualisation automatique
// ----------------------

setInterval(async () => {

    await checkApiHealth();
    await loadQueue();
    await loadNext();

}, 5000);


// --------------------------------------------------
// Initialisation
// ----------------------------------------------

async function init() {

    await chargerConfig();
    await checkApiHealth();
    await loadQueue();
    await loadNext();
}

init();