function escapeHtml(value) {
    if (value == null) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function loadPatients() {
    try {
        const stored =
            localStorage.getItem("patients");

        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.warn("Could not load saved patients:", error);
    }

    return null;
}

const emptyVitalValue = "N/A";

function normalizeVitals(vitals = {}) {

    const source =
        vitals || {};

    return {

        bp:
            source.bp ?? "",

        map:
            source.map ??
            source.Map ??
            "",

        hr:
            source.hr ?? "",

        spo2:
            source.spo2 ?? "",

        temp:
            source.temp ?? "",

        savedAt:
            source.savedAt || ""

    };

}

function hasVitals(vitals) {

    return [
        "bp",
        "map",
        "hr",
        "spo2",
        "temp"
    ].some(
        key =>
            String(
                vitals?.[key] ?? ""
            ).trim() !== ""
    );

}

function ensureVitalsHistory(patient) {

    if (!patient) {
        return [];
    }

    if (!Array.isArray(patient.vitalsHistory)) {
        patient.vitalsHistory = [];
    }

    patient.vitalsHistory =
        patient.vitalsHistory
            .map(normalizeVitals)
            .filter(hasVitals);

    const currentVitals =
        normalizeVitals(patient.vitals);

    if (
        hasVitals(currentVitals) &&
        patient.vitalsHistory.length === 0
    ) {
        patient.vitalsHistory.push(
            currentVitals
        );
    }

    const latestVitals =
        patient.vitalsHistory[
            patient.vitalsHistory.length - 1
        ] || currentVitals;

    patient.vitals =
        normalizeVitals(latestVitals);

    return patient.vitalsHistory;

}

function getVitalsHistory(patient) {

    return ensureVitalsHistory(patient);

}

function parseVitalNumber(value) {

    const number =
        Number.parseFloat(value);

    return Number.isFinite(number)
        ? number
        : null;

}

function averageVitalNumber(
    vitalsHistory,
    key,
    decimals = 0
) {

    const values =
        vitalsHistory
            .map(
                vitals =>
                    parseVitalNumber(
                        vitals[key]
                    )
            )
            .filter(
                value =>
                    value !== null
            );

    if (values.length === 0) {
        return emptyVitalValue;
    }

    const average =
        values.reduce(
            (sum, value) =>
                sum + value,
            0
        ) / values.length;

    return decimals > 0
        ? average.toFixed(decimals)
        : String(Math.round(average));

}

function averageBloodPressure(vitalsHistory) {

    const values =
        vitalsHistory
            .map(vitals => {

                const match =
                    String(vitals.bp || "")
                        .match(
                            /^\s*(\d+)\s*\/\s*(\d+)\s*$/
                        );

                if (!match) {
                    return null;
                }

                return {
                    systolic:
                        Number(match[1]),
                    diastolic:
                        Number(match[2])
                };

            })
            .filter(Boolean);

    if (values.length === 0) {
        return emptyVitalValue;
    }

    const systolic =
        values.reduce(
            (sum, value) =>
                sum + value.systolic,
            0
        ) / values.length;

    const diastolic =
        values.reduce(
            (sum, value) =>
                sum + value.diastolic,
            0
        ) / values.length;

    return `${Math.round(systolic)}/${Math.round(diastolic)}`;

}

function calculateVitalAverages(patient) {

    const vitalsHistory =
        getVitalsHistory(patient);

    return {
        bp:
            averageBloodPressure(vitalsHistory),
        map:
            averageVitalNumber(vitalsHistory, "map"),
        hr:
            averageVitalNumber(vitalsHistory, "hr"),
        spo2:
            averageVitalNumber(vitalsHistory, "spo2"),
        temp:
            averageVitalNumber(vitalsHistory, "temp", 1),
        count:
            vitalsHistory.length
    };

}

function renderVitalMetric(label, value) {

    return `
        <div class="vital-metric">
            <span>${escapeHtml(value)}</span>
            <small>${escapeHtml(label)}</small>
        </div>
    `;

}

function renderAverageVitalsGrid(patient, className) {

    const averages =
        calculateVitalAverages(patient);

    return `
        <div class="${className}">
            ${renderVitalMetric("BP", averages.bp)}
            ${renderVitalMetric("MAP", averages.map)}
            ${renderVitalMetric("HR", averages.hr)}
            ${renderVitalMetric("SpO2", averages.spo2)}
            ${renderVitalMetric("Temp", averages.temp)}
        </div>
    `;

}

function renderPatientAverageVitals(patient) {

    const averages =
        calculateVitalAverages(patient);

    return `
        <div class="patient-card-vitals">
            <div class="patient-card-vitals-title">
                Average Vitals
            </div>

            ${renderAverageVitalsGrid(
                patient,
                "patient-card-vitals-grid"
            )}

            <div class="patient-card-vitals-count">
                ${averages.count} saved
            </div>
        </div>
    `;

}

function formatSavedAt(value, fallback) {

    if (!value) {
        return fallback;
    }

    const date =
        new Date(value);

    if (Number.isNaN(date.getTime())) {
        return fallback;
    }

    return date.toLocaleString(
        [],
        {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );

}

function renderVitalsHistory(patient) {

    const vitalsHistory =
        getVitalsHistory(patient);

    if (vitalsHistory.length === 0) {
        return `
            <p class="empty-vitals">
                No saved vitals yet.
            </p>
        `;
    }

    return vitalsHistory
        .slice()
        .reverse()
        .map(
            (vitals, index) => {

                const isBaseline =
                    vitalsHistory.length - index === 1;

                return `
                    <div class="vitals-history-item">
                        <strong>
                            ${escapeHtml(
                                formatSavedAt(
                                    vitals.savedAt,
                                    isBaseline
                                        ? "Baseline"
                                        : "Saved Vitals"
                                )
                            )}
                        </strong>

                        <div class="vitals-history-grid">
                            ${renderVitalMetric(
                                "BP",
                                vitals.bp || emptyVitalValue
                            )}
                            ${renderVitalMetric(
                                "MAP",
                                vitals.map || emptyVitalValue
                            )}
                            ${renderVitalMetric(
                                "HR",
                                vitals.hr || emptyVitalValue
                            )}
                            ${renderVitalMetric(
                                "SpO2",
                                vitals.spo2 || emptyVitalValue
                            )}
                            ${renderVitalMetric(
                                "Temp",
                                vitals.temp || emptyVitalValue
                            )}
                        </div>
                    </div>
                `;

            }
        )
        .join("");

}

let patients = loadPatients() || [

    {
        id: 1,
        name: "John Smith",
        room: "101",
        diagnosis: "CHF",
        status: "Stable",   

        age: 67,

        medications: [
            "lasix",
            "Metoprolol"
        ],

        notes:
            "Daily weights. Monitor fluid balance.",

         vitals: {

        bp: "122/80",

        map: 95,

        hr: 78,

        spo2: 95,

        temp: 97.5

    }
    },

    {
        id: 2,
        name: "Mary Jones",
        room: "102",
        diagnosis: "COPD",
        status: "Observation",

        age: 72,
        
        medications: [
            "Albuterol",
            "Spiriva"
        ],

        notes:
            "Oxygen as needed. Monitor respiratory status.",

         vitals: {

        bp: "105/77",

        map: 79,

        hr: 94,

        spo2: 95,

        temp: 98

    }
    },

    {
        id: 3,
        name: "Robert Brown",
        room: "103",
        diagnosis: "Pneumonia",
        status: "Stable",

        age: 80,

        medications: [
            "Levofloxacin",
            "Tylenol"
        ],  

        notes:
            "IV antibiotics. Monitor for fever and respiratory status.",

        vitals: {

        bp: "128/76",

        map: 93,

        hr: 78,

        spo2: 98,

        temp: 98.6

    }

    
    },

    {
        id: 4,
        name: "Sarah Wilson",
        room: "104",
        diagnosis: "Stroke",
        status: "Critical",

        age: 75,
        
        medications: [
            "Aspirin",
            "Atorvastatin"
        ],
        notes:
            "Monitor neurological status. Administer anticoagulation as ordered.",
            
         vitals: {

        bp: "147/85",

        map: 104,

        hr: 63,

        spo2: 100,

        temp: 97.9

    }
        
    },
    
];

patients.forEach(
    ensureVitalsHistory
);

const patientModal =
    document.getElementById(
        "patient-modal"
    );

const modalDetails =
    document.getElementById(
        "modal-details"
    );

const closeModal =
    document.getElementById(
        "close-modal"
    );

let editingPatientId = null;

function savePatients() {

    localStorage.setItem(
        "patients",
        JSON.stringify(
            patients
        )
    );

}

const statsContainer =
    document.getElementById(
        "stats-container"
    );

const patientForm =
    document.getElementById(
        "patient-form"
    );

const patientName =
    document.getElementById(
        "patient-name"
    );

const patientRoom =
    document.getElementById(
        "patient-room"
    );

const patientDiagnosis =
    document.getElementById(
        "patient-diagnosis"
    );

const patientStatus =
    document.getElementById(
        "patient-status"
    );


const patientsContainer =
    document.getElementById(
        "patients-container"
    );

const analyticsContainer =
    document.getElementById(
        "analytics-container"
    );

const toast =
    document.getElementById(
        "toast"
    );

function renderPatients(patientsList) {

    patientsContainer.innerHTML = "";

    if (patientsList.length === 0) {

        patientsContainer.innerHTML = `

            <div class="empty-state">

                <h2>
                    No Patients Found
                </h2>

                <p>
                    Add a patient to get started.
                </p>

            </div>

        `;

        return;
    }

    patientsList.forEach((patient) => {

        ensureVitalsHistory(patient);

        const averageVitalsMarkup =
            renderPatientAverageVitals(patient);

        patientsContainer.innerHTML += `
            <div
                class="patient-card"
                onclick="openPatient(${patient.id})"
            >
                <div class="patient-card-header">
                    <h3>${escapeHtml(patient.name)}</h3>

                    <div class="patient-card-actions">
                        <button
                            class="edit-btn"
                            onclick="
                                event.stopPropagation();
                                openEditPatient(${patient.id});
                            "
                        >
                            Edit Patient
                        </button>

                        <button
                            class="delete-btn"
                            onclick="
                                event.stopPropagation();
                                deletePatient(${patient.id});
                            "
                        >
                            Delete
                        </button>
                    </div>
                </div>

                <p>Room:${escapeHtml(patient.room)}</p>
                <p>Diagnosis:${escapeHtml(patient.diagnosis)}</p>
                <p>
                    Status:

                    <span class="status ${escapeHtml(patient.status.toLowerCase())}">
                        ${escapeHtml(patient.status)}
                    </span>

                </p>

                ${averageVitalsMarkup}

            </div>
        `;
    });
}

renderPatients(patients);

sortPatients();

function deletePatient(id) {

    const deletedPatient =
        patients.find(
            patient => patient.id === id
        );

    patients = patients.filter(
        patient => patient.id !== id
    );

    savePatients();

    showToast(
        `✓ ${deletedPatient?.name || "Patient"} Deleted`
    );

    sortPatients();

    renderPatients(
        patients
    );

    renderStats(
        patients
    );

    renderAnalytics(
        patients
    );

    renderChart(
        patients
    );

}

const searchInput =
    document.getElementById(
        "search-input"
    );

searchInput.addEventListener(
    "input", 
    () => {

        const searchTerm =
            searchInput.value.toLowerCase();

        const filteredPatients =
            patients.filter(patient => {

                return (
                    patient.name
                    .toLowerCase()
                    .includes(searchTerm) 
                    ||

                    patient.diagnosis
                    .toLowerCase()
                    .includes(searchTerm)
                );
            });
        
        renderPatients(
            filteredPatients
        );

        renderStats(
            filteredPatients
        );

        renderAnalytics(
            filteredPatients
        );

        renderChart(
            filteredPatients
        );

     }
    );

patientForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();

       const newPatient = {

            id: Date.now(),

            name:
                patientName.value.trim(),

            room:
                patientRoom.value.trim(),

            diagnosis:
                patientDiagnosis.value.trim(),

            status:
                patientStatus.value,

            age:
                "Unknown",

            medications: [],

            notes: "",

            vitals: {

                bp: "",

                map: "",

                hr: "",

                spo2: "",

                temp: ""

            },

            vitalsHistory: []

    };

    patients.push(
        newPatient
    );

    sortPatients();

    savePatients();

    showToast(
    `✓ ${newPatient.name} Added`
);

    renderPatients(
      patients
    );

    renderStats(
        patients
    );

    renderAnalytics(
        patients
    );

    renderChart(
        patients
    );

    patientForm.reset();

}
);

function renderStats(patientList) {

    const totalPatients =
        patientList.length;

    const stablePatients =
        patientList.filter(
            patient =>
                patient.status === "Stable"
        ).length;

    const observationPatients =
        patientList.filter(
            patient =>
                patient.status === "Observation"
        ).length;

    const criticalPatients =
        patientList.filter(
            patient =>
                patient.status === "Critical"
        ).length;

    statsContainer.innerHTML = `

        <div class="stat-box">

            <div class="stat-number">

                ${totalPatients}

            </div>

            <p>Total Patients</p>

        </div>

        <div class="stat-box">

            <div class="stat-number">

                ${stablePatients}

            </div>

            <p>🟢 Stable</p>

        </div>

        <div class="stat-box">

            <div class="stat-number">

                ${observationPatients}

            </div>

            <p>🟡 Observation</p>

        </div>

        <div class="stat-box">

            <div class="stat-number">

                ${criticalPatients}

            </div>

            <p>🔴 Critical</p>

        </div>

    `;
}

renderStats(patients);

function sortPatients() {

    const priority = {

        Critical: 1,
        Observation: 2,
        Stable: 3
        
    };

    patients.sort(  
        (a, b) => 

            priority[a.status] 
            -   
            priority[b.status]

    );
}

function openPatient(id) {

    const patient =
        patients.find(
            patient =>
                patient.id === id
        );

    if (!patient) {
        return;
    }

    ensureVitalsHistory(patient);

    const mapValue =
        patient.vitals?.map ??
        patient.vitals?.Map ??
        "";

    const vitalsAverageMarkup =
        renderAverageVitalsGrid(
            patient,
            "modal-vitals-average-grid"
        );

    const vitalsHistoryMarkup =
        renderVitalsHistory(patient);

    modalDetails.innerHTML = `

    <div class="patient-header">

        <h2>${escapeHtml(patient.name)}</h2>

        <span class="status-badge">

            ${escapeHtml(patient.status)}

        </span>

    </div>

    <div class="modal-section">

        <h3>Patient Information</h3>

        <p><strong>Room:</strong> ${escapeHtml(patient.room)}</p>

        <p><strong>Diagnosis:</strong> ${escapeHtml(patient.diagnosis)}</p>

        <p><strong>Status:</strong> ${escapeHtml(patient.status)}</p>

        <p><strong>Age:</strong> ${escapeHtml(patient.age || "Unknown")}</p>

    </div>

    <div class="modal-section vitals-section">

        <h3>Vital Signs</h3>

        <div class="vitals-layout">

            <div class="vitals-entry">

                <label>Blood Pressure</label>

                <input
                    id="bp-input"
                    value="${escapeHtml(patient.vitals?.bp || "")}"
                >

                <label>MAP</label>

                <input
                    id="map-input"
                    value="${escapeHtml(mapValue)}"
                >

                <label>Heart Rate</label>

                <input
                    id="hr-input"
                    value="${escapeHtml(patient.vitals?.hr || "")}"
                >

                <label>SpO₂</label>

                <input
                    id="spo2-input"
                    value="${escapeHtml(patient.vitals?.spo2 || "")}"
                >

                <label>Temperature</label>

                <input
                    id="temp-input"
                    value="${escapeHtml(patient.vitals?.temp || "")}"
                >

                <button
                    onclick="saveVitals(${patient.id})"
                >

                    Save Vitals

                </button>

            </div>

            <div class="vitals-review">

                <div class="vitals-average-summary">

                    <h4>Averages</h4>

                    ${vitalsAverageMarkup}

                </div>

                <div class="vitals-history-summary">

                    <h4>Previous Saved Vitals</h4>

                    <div class="vitals-history-list">
                        ${vitalsHistoryMarkup}
                    </div>

                </div>

            </div>

        </div>
    </div>

    <div class="modal-section">

        <h3>Medications</h3>

        <ul>
            ${(patient.medications || [])
        .map(
            med =>

            `
            <li class="medication-item">

                ${escapeHtml(med)}

                <button
                    class="remove-med-btn"
                    onclick="
                        removeMedication(
                            ${patient.id},
                            ${JSON.stringify(med)}
                        )
                    "
                >

                    ✕

                </button>

            </li>
            `
        )
        .join("")
    }
        </ul>

            <input
                id="new-medication"
                placeholder="Medication name"
            >

            <button
                onclick="addMedication(${patient.id})"
            >

                Add Medication

            </button>
    </div>

    <div class="modal-section">

    <h3>Notes</h3>

        <textarea
        id="patient-notes"
        rows="5"
    >${escapeHtml(patient.notes || "")}</textarea>

        <button
        onclick="saveNotes(${patient.id})"
        >

        Save Notes

        </button>

    </div>
`;

    patientModal.classList.remove(
        "hidden-modal"
    );
}

closeModal.addEventListener(
    "click",
    () => {

        patientModal.classList.add(
            "hidden-modal"
        );

    }
);

const editModal =
    document.getElementById(
        "edit-modal"
    );

const closeEditModalButton =
    document.getElementById(
        "close-edit-modal"
    );

closeEditModalButton.addEventListener(
    "click",
    closeEditModal
);

editModal.addEventListener(
    "click",
    (event) => {

        if (event.target === editModal) {
            closeEditModal();
        }

    }
);

function saveNotes(id) {

    const patient =
        patients.find(
            patient =>
                patient.id === id
        );

    if (!patient) {
        return;
    }

    patient.notes =
        document.getElementById(
            "patient-notes"
        ).value;
        
    savePatients();

    showToast(
        "✓ Notes Saved"
    );

}

function saveVitals(id) {

    const patient =
        patients.find(
            patient =>
                patient.id === id
        );

    if (!patient) {
        return;
    }

    const savedVitals = {

        bp:
            document.getElementById(
                "bp-input"
            ).value.trim(),

        map:
            document.getElementById(
                "map-input"
            ).value.trim(),

        hr:
            document.getElementById(
                "hr-input"
            ).value.trim(),

        spo2:
            document.getElementById(
                "spo2-input"
            ).value.trim(),

        temp:
            document.getElementById(
                "temp-input"
            ).value.trim(),

        savedAt:
            new Date().toISOString()

    };

    if (!hasVitals(savedVitals)) {

        showToast(
            "Add vitals before saving"
        );

        return;

    }

    patient.vitals =
        savedVitals;

    if (!Array.isArray(patient.vitalsHistory)) {
        patient.vitalsHistory = [];
    }

    patient.vitalsHistory.push(
        savedVitals
    );

    savePatients();

    renderPatients(patients);

    renderAnalytics(patients);

    renderChart(patients);

    openPatient(id);

    showToast(
        "✓ Vitals Saved"
    );

}

const THEME_STORAGE_KEY = "theme";
const PAGE_SIZE_STORAGE_KEY = "page-size";
const pageSizeOptions = [
    "normal",
    "large",
    "xlarge"
];

function applyTheme(theme) {

    document.body.classList.toggle(
        "light-mode",
        theme === "light"
    );

}

function saveTheme(theme) {

    localStorage.setItem(
        THEME_STORAGE_KEY,
        theme
    );

}

function getSavedTheme() {

    const savedTheme =
        localStorage.getItem(
            THEME_STORAGE_KEY
        );

    return savedTheme === "light"
        ? "light"
        : "dark";

}

function applyPageSize(pageSize) {

    const size =
        pageSizeOptions.includes(pageSize)
            ? pageSize
            : "normal";

    document.body.classList.toggle(
        "page-size-large",
        size === "large"
    );

    document.body.classList.toggle(
        "page-size-xlarge",
        size === "xlarge"
    );

    document
        .querySelectorAll(
            "[data-page-size]"
        )
        .forEach(button => {

            const isActive =
                button.dataset.pageSize === size;

            button.classList.toggle(
                "active",
                isActive
            );

            button.setAttribute(
                "aria-pressed",
                String(isActive)
            );

        });

}

function savePageSize(pageSize) {

    localStorage.setItem(
        PAGE_SIZE_STORAGE_KEY,
        pageSize
    );

}

function getSavedPageSize() {

    const savedPageSize =
        localStorage.getItem(
            PAGE_SIZE_STORAGE_KEY
        );

    return pageSizeOptions.includes(savedPageSize)
        ? savedPageSize
        : "normal";

}

applyTheme(getSavedTheme());
applyPageSize(getSavedPageSize());

const themeToggle =
    document.getElementById(
        "theme-toggle"
    );

themeToggle.addEventListener(
    "click",
    () => {

        const isLightMode =
            document.body.classList.toggle(
                "light-mode"
            );

        saveTheme(
            isLightMode
                ? "light"
                : "dark"
        );

    }
);

document
    .querySelectorAll(
        "[data-page-size]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const pageSize =
                    button.dataset.pageSize;

                applyPageSize(pageSize);

                savePageSize(pageSize);

            }
        );

    });

function renderAnalytics() {

    analyticsContainer.innerHTML = "";

}

renderAnalytics(patients);

const chartContainer =
    document.getElementById(
        "chart-container"
    );

function renderChart(patientList = patients) {

    const barWidthPerPatient = 36;

    const critical =
        patientList.filter(
            p => p.status === "Critical"
        ).length;

    const observation =
        patientList.filter(
            p => p.status === "Observation"
        ).length;

    const stable =
        patientList.filter(
            p => p.status === "Stable"
        ).length;

    chartContainer.innerHTML = `

        <h2>
            Patient Status Distribution
        </h2>

        <div class="chart-row">

            <div class="chart-label">
                Critical (${critical})
            </div>

            <div
                class="chart-bar critical-bar"
                style="width:${critical * barWidthPerPatient}px"
            ></div>

        </div>

        <div class="chart-row">

            <div class="chart-label">
                Observation (${observation})
            </div>

            <div
                class="chart-bar observation-bar"
                style="width:${observation * barWidthPerPatient}px"
            ></div>

        </div>

        <div class="chart-row">

            <div class="chart-label">
                Stable (${stable})
            </div>

            <div
                class="chart-bar stable-bar"
                style="width:${stable * barWidthPerPatient}px"
            ></div>

        </div>

    `;

}

renderChart(patients);

function animateValue(
    element,
    start,
    end,
    duration,
    decimals = 0
) {

    let startTime = null;

    function update(
        currentTime
    ) {

        if (!startTime) {

            startTime =
                currentTime;

        }

        const progress =
            Math.min(

                (
                    currentTime -
                    startTime
                )

                /

                duration,

                1

            );

        const value =

            progress *

                (
                    end -
                    start
                )

                +

                start;

        element.textContent =
            decimals > 0
                ? value.toFixed(decimals)
                : Math.floor(value);

        if (
            progress < 1
        ) {

            requestAnimationFrame(
                update
            );

        }

    }

    requestAnimationFrame(
        update
    );

}

function addMedication(id) {

    const patient =
        patients.find(
            patient =>
                patient.id === id
        );

    if (!patient) {
        return;
    }

    const medicationInput =
        document.getElementById(
            "new-medication"
        );

    const medication =
        medicationInput.value.trim();

    if (!medication) {

        return;

    }

    if (!patient.medications) {

    patient.medications = [];

    }

    patient.medications.push(
        medication
    );

    savePatients();

    showToast(
    `${medication} Added`
);

    openPatient(id);

}

function removeMedication(
    patientId,
    medication
) {

    const patient =
        patients.find(
            patient =>
                patient.id === patientId
        );

    if (!patient?.medications) {
        return;
    }

    patient.medications =
        patient.medications.filter(
            med =>
                med !== medication
        );

    savePatients();

   showToast(
    `${medication} removed`
);
    openPatient(
        patientId
    );

}

function showToast(message) {

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },

        2000

    );

}

function openEditPatient(id) {

    const patient =
        patients.find(
            patient =>
                patient.id === id
        );

    if (!patient) {
        return;
    }

    document.getElementById(
        "edit-name"
    ).value =
        patient.name;

    document.getElementById(
        "edit-room"
    ).value =
        patient.room;

    document.getElementById(
        "edit-diagnosis"
    ).value =
        patient.diagnosis;

    document.getElementById(
        "edit-status"
    ).value =
        patient.status;

    editingPatientId =
        id;

    document
        .getElementById(
            "edit-modal"
        )
        .classList.remove(
            "hidden-modal"
        );

}

function closeEditModal() {

    document
        .getElementById(
            "edit-modal"
        )
        .classList.add(
            "hidden-modal"
        );

    editingPatientId = null;

}

function savePatientEdit() {

    if (editingPatientId == null) {
        return;
    }

    const patient =
        patients.find(
            patient =>
                patient.id ===
                editingPatientId
        );

    if (!patient) {
        closeEditModal();
        return;
    }

    patient.name =
        document.getElementById(
            "edit-name"
        ).value.trim();

    patient.room =
        document.getElementById(
            "edit-room"
        ).value.trim();

    patient.diagnosis =
        document.getElementById(
            "edit-diagnosis"
        ).value.trim();

    patient.status =
        document.getElementById(
            "edit-status"
        ).value;

    savePatients();

    sortPatients();

    renderPatients(
        patients
    );

    renderStats(
        patients
    );

    renderAnalytics(patients);

    renderChart(patients);

    closeEditModal();

    showToast(
        "✓ Patient Updated"
    );

}
