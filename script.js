let patients =
    JSON.parse(
        localStorage.getItem(
            "patients"
        )
    ) || [

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

        Map: 95,

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

        Map: 79,

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

        Map: 93,

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

        Map: 104,

        hr: 63,

        spo2: 100,

        temp: 97.9

    }
        
    },
    
];

console.log(patients);

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

const submitButton =
    patientForm.querySelector(
        "button"
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

function renderPatients(patientsList) {

    patientsContainer.innerHTML = "";

    patientsList.forEach((patient, index) => {

        patientsContainer.innerHTML += `
            <div 
                class="patient-card"
                onclick="openPatient(${patient.id})"
            >
                <h3>${patient.name}</h3>
                <p>Room:${patient.room}</p>
                <p>Diagnosis:${patient.diagnosis}</p>
                <p>
                    Status:

                    <span class="status ${patient.status.toLowerCase()}">
                        ${patient.status}
                    </span> 
                    
                </p>

                <button
                    class="edit-btn"
                    onclick="editPatient(${patient.id})"
                >
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deletePatient(${patient.id})"
                >
                    Delete
                </button>

            </div>
        `;
    });

    if (
    patientsList.length === 0
    ) {

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
}

renderPatients(patients);

sortPatients();

function deletePatient(id) {

    patients = patients.filter(
        patient => patient.id !== id
    );

    savePatients();

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

function editPatient(id) {

    const patient =
        patients.find(
            patient =>
                patient.id === id
        );

    patientName.value =
        patient.name;

    patientRoom.value =
        patient.room;

    patientDiagnosis.value =
        patient.diagnosis;

    patientStatus.value =
        patient.status;

    editingPatientId = id;

   submitButton.textContent =
    "Save Changes"; 

}

const searchInput =
    document.getElementById(
        "search-input"
    );

console.log(searchInput);

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
                patientName.value,

            room:
                patientRoom.value,

            diagnosis:
                patientDiagnosis.value,

            status:
                patientStatus.value,

            age:
                "Unknown",

            medications: [],

            notes: "",

            vitals: {

                bp: "",

                hr: "",

                spo2: "",

                temp: ""

            }

    };

    if (editingPatientId) {

    const patient =
        patients.find(
            patient =>
                patient.id ===
                editingPatientId
        );

    patient.name =
        patientName.value;

    patient.room =
        patientRoom.value;

    patient.diagnosis =
        patientDiagnosis.value;

    patient.status =
        patientStatus.value;

    editingPatientId = null;

    submitButton.textContent =
    "Add Patient";

    } 
    
    else {

    patients.push(
        newPatient
    );

    }


    savePatients();

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
    console.log("Clicked patient ID:", id);

    const patient =
        patients.find(
            patient =>
                patient.id === id
        );
    console.log("Found patient:", patient);

    modalDetails.innerHTML = `

    <div class="patient-header">

        <h2>${patient.name}</h2>

        <span class="status-badge">

            ${patient.status}

        </span>

    </div>

    <div class="modal-section">

        <h3>Patient Information</h3>

        <p><strong>Room:</strong> ${patient.room}</p>

        <p><strong>Diagnosis:</strong> ${patient.diagnosis}</p>

        <p><strong>Status:</strong> ${patient.status}</p>

        <p><strong>Age:</strong> ${patient.age || "Unknown"}</p>

    </div>

    <p><strong>Room:</strong> ${patient.room}</p>

    <p><strong>Diagnosis:</strong> ${patient.diagnosis}</p>

    <p><strong>Status:</strong> ${patient.status}</p>

    <p><strong>Age:</strong> ${patient.age || "Age Unknown"}</p>

    <div class="modal-section">

        <h3>Vital Signs</h3>

        <label>Blood Pressure</label>

        <input
            id="bp-input"
            value="${patient.vitals?.bp || ""}"
        >

        <label>MAP</label>

        <input
            id="map-input"
            value="${patient.vitals?.map || ""}"
        >

        <label>Heart Rate</label>

        <input
            id="hr-input"
            value="${patient.vitals?.hr || ""}"
        >

        <label>SpO₂</label>

        <input
            id="spo2-input"
            value="${patient.vitals?.spo2 || ""}"
        >

        <label>Temperature</label>

        <input
            id="temp-input"
            value="${patient.vitals?.temp || ""}"
        >

        <button
            onclick="saveVitals(${patient.id})"
        >

            Save Vitals

        </button>
    </div>

    <div class="modal-section">

        <h3>Medications</h3>

        <ul>
            ${(patient.medications || [])
        .map(
            med =>

            `
            <li class="medication-item">

                ${med}

                <button
                    class="remove-med-btn"
                    onclick="
                        removeMedication(
                            ${patient.id},
                            '${med}'
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
    >

        ${patient.notes || ""}

        </textarea>

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

function saveNotes(id) {    

    console.log("Saving notes for:", id);

    const patient =
        patients.find(
            patient =>
                patient.id === id
        );

    console.log("Found patient:", patient);


    patient.notes =
        document.getElementById(
            "patient-notes"
        ).value;
    
    console.log("New notes:", patient.notes);
        
    savePatients();

    alert(
        "Notes Saved"
    );

}

function saveVitals(id) {

    const patient =
        patients.find(
            patient =>
                patient.id === id
        );

    patient.vitals = {

        bp:
            document.getElementById(
                "bp-input"
            ).value,

        map:
            document.getElementById(
                "map-input"
            ).value,

        hr:
            document.getElementById(
                "hr-input"
            ).value,

        spo2:
            document.getElementById(
                "spo2-input"
            ).value,

        temp:
            document.getElementById(
                "temp-input"
            ).value

    };

    savePatients();

    renderAnalytics(patients);

    renderChart(patients);

    alert(
        "Vitals Saved"
    );

}

const themeToggle =
    document.getElementById(
        "theme-toggle"
    );

themeToggle.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "light-mode"
        );

    }
);

function renderAnalytics() {

    const avgHR =

        (
            patients.reduce(
                (sum, patient) =>

                    sum +

                    Number(
                        patient.vitals?.hr || 0
                    ),

                0
            )

            /

            patients.length

        ).toFixed(0);

    const avgSpo2 =

        (
            patients.reduce(
                (sum, patient) =>

                    sum +

                    Number(
                        patient.vitals?.spo2 || 0
                    ),

                0
            )

            /

            patients.length

        ).toFixed(0);

    const avgTemp =

        (
            patients.reduce(
                (sum, patient) =>

                    sum +

                    Number(
                        patient.vitals?.temp || 0
                    ),

                0
            )

            /

            patients.length

        ).toFixed(1);

    analyticsContainer.innerHTML = `

        <div class="analytics-card">

            <h3 id="avg-hr">
                0
            </h3>

            <p>Average HR</p>

        </div>

        <div class="analytics-card">

            <h3 id="avg-spo2">
                0
            </h3>

            <p>Average SpO₂</p>

        </div>

        <div class="analytics-card">

            <h3 id="avg-temp">
                0
            </h3>

            <p>Average Temp</p>

        </div>

        <div class="analytics-card">

            <h3 id="total-patients">
                0
            </h3>

            <p>Total Patients</p>

        </div>

    `;

    animateValue(

    document.getElementById(
        "avg-hr"
    ),

    0,

    Number(
        avgHR
    ),

    1000

);

animateValue(

    document.getElementById(
        "avg-spo2"
    ),

    0,

    Number(
        avgSpo2
    ),

    1000

);
}

renderAnalytics(patients);

const chartContainer =
    document.getElementById(
        "chart-container"
    );

console.log(chartContainer);

function renderChart() {

    console.log("renderChart running");

    const critical =
        patients.filter(
            p => p.status === "Critical"
        ).length;

    const observation =
        patients.filter(
            p => p.status === "Observation"
        ).length;

    const stable =
        patients.filter(
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
                style="width:${critical * 60}px"
            ></div>

        </div>

        <div class="chart-row">

            <div class="chart-label">
                Observation (${observation})
            </div>

            <div
                class="chart-bar observation-bar"
                style="width:${observation * 60}px"
            ></div>

        </div>

        <div class="chart-row">

            <div class="chart-label">
                Stable (${stable})
            </div>

            <div
                class="chart-bar stable-bar"
                style="width:${stable * 60}px"
            ></div>

        </div>

    `;

    console.log(chartContainer.innerHTML);
}

renderChart();

function animateValue(
    element,
    start,
    end,
    duration
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

            Math.floor(

                progress *

                (
                    end -
                    start
                )

                +

                start

            );

        element.textContent =
            value;

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

    patient.medications =
        patient.medications.filter(
            med =>
                med !== medication
        );

    savePatients();

    openPatient(
        patientId
    );

}