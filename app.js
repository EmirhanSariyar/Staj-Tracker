const STORAGE_KEY = "internship-tracker-applications-v1";
const STATUSES = ["Wishlist", "Applied", "OA", "Interview", "Offer", "Rejected"];

const sampleApplications = [
  {
    id: crypto.randomUUID(),
    companyName: "Aselsan",
    appliedPosition: "Yazilim Stajyeri",
    dateApplied: "2026-03-12",
    applicationStatus: "Applied",
    applicantPortal: "https://kariyer.aselsan.com.tr/",
    followUpDate: "2026-03-27",
    details: "Backend ekibi icin basvuru. Referans notu eklendi.",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    companyName: "Trendyol",
    appliedPosition: "Data Analyst Intern",
    dateApplied: "2026-03-08",
    applicationStatus: "Interview",
    applicantPortal: "https://career.trendyol.com/",
    followUpDate: "2026-03-24",
    details: "IK gorusmesi olumlu gecti. Teknik case bekleniyor.",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    companyName: "Microsoft",
    appliedPosition: "Explore Intern",
    dateApplied: "2026-03-20",
    applicationStatus: "Wishlist",
    applicantPortal: "https://jobs.careers.microsoft.com/",
    followUpDate: "",
    details: "CV ve cover letter uyarlamasi yapilacak.",
    createdAt: new Date().toISOString(),
  },
];

const form = document.querySelector("#application-form");
const editingIdInput = document.querySelector("#editing-id");
const companyInput = document.querySelector("#company-name");
const positionInput = document.querySelector("#applied-position");
const dateAppliedInput = document.querySelector("#date-applied");
const statusInput = document.querySelector("#application-status");
const portalInput = document.querySelector("#applicant-portal");
const followUpInput = document.querySelector("#follow-up-date");
const detailsInput = document.querySelector("#details");
const clearFormBtn = document.querySelector("#clear-form-btn");
const loadSampleBtn = document.querySelector("#load-sample-btn");
const searchInput = document.querySelector("#search-input");
const statusFilter = document.querySelector("#status-filter");
const sortBySelect = document.querySelector("#sort-by");
const exportBtn = document.querySelector("#export-btn");
const exportCsvBtn = document.querySelector("#export-csv-btn");
const importFileInput = document.querySelector("#import-file");
const importCsvFileInput = document.querySelector("#import-csv-file");
const applicationsGrid = document.querySelector("#applications-grid");
const kanbanBoard = document.querySelector("#kanban-board");
const resultsSummary = document.querySelector("#results-summary");
const cardTemplate = document.querySelector("#application-card-template");
const gridViewBtn = document.querySelector("#grid-view-btn");
const kanbanViewBtn = document.querySelector("#kanban-view-btn");

const totalCount = document.querySelector("#total-count");
const interviewCount = document.querySelector("#interview-count");
const offerCount = document.querySelector("#offer-count");
const wishlistCount = document.querySelector("#wishlist-count");
const rejectedCount = document.querySelector("#rejected-count");

let applications = loadApplications();
let currentView = "grid";

function loadApplications() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return [];
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveApplications() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
}

function formatDate(dateString) {
  if (!dateString) {
    return "Not set";
  }

  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function getStatusOrder(status) {
  return STATUSES.indexOf(status);
}

function getFilteredApplications() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;
  const [sortField, sortDirection] = sortBySelect.value.split("-");

  return [...applications]
    .filter((application) => {
      const matchesSearch =
        !searchTerm ||
        [
          application.companyName,
          application.appliedPosition,
          application.details,
          application.applicationStatus,
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm);

      const matchesStatus =
        selectedStatus === "All" || application.applicationStatus === selectedStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((first, second) => {
      if (sortField === "companyName") {
        return sortDirection === "asc"
          ? first.companyName.localeCompare(second.companyName)
          : second.companyName.localeCompare(first.companyName);
      }

      if (sortField === "status") {
        return sortDirection === "asc"
          ? getStatusOrder(first.applicationStatus) - getStatusOrder(second.applicationStatus)
          : getStatusOrder(second.applicationStatus) - getStatusOrder(first.applicationStatus);
      }

      const firstValue = first[sortField] || "";
      const secondValue = second[sortField] || "";

      if (!firstValue && !secondValue) {
        return 0;
      }

      if (!firstValue) {
        return 1;
      }

      if (!secondValue) {
        return -1;
      }

      return sortDirection === "asc"
        ? firstValue.localeCompare(secondValue)
        : secondValue.localeCompare(firstValue);
    });
}

function updateStats() {
  totalCount.textContent = applications.length;
  interviewCount.textContent = applications.filter(
    (application) => application.applicationStatus === "Interview",
  ).length;
  offerCount.textContent = applications.filter(
    (application) => application.applicationStatus === "Offer",
  ).length;
  wishlistCount.textContent = applications.filter(
    (application) => application.applicationStatus === "Wishlist",
  ).length;
  rejectedCount.textContent = applications.filter(
    (application) => application.applicationStatus === "Rejected",
  ).length;
}

function updateApplicationStatus(id, nextStatus) {
  applications = applications.map((application) =>
    application.id === id ? { ...application, applicationStatus: nextStatus } : application,
  );
  saveApplications();
  renderApplications();
}

function resetForm() {
  form.reset();
  editingIdInput.value = "";
  statusInput.value = "Wishlist";
  dateAppliedInput.value = new Date().toISOString().slice(0, 10);
}

function populateForm(application) {
  editingIdInput.value = application.id;
  companyInput.value = application.companyName;
  positionInput.value = application.appliedPosition;
  dateAppliedInput.value = application.dateApplied;
  statusInput.value = application.applicationStatus;
  portalInput.value = application.applicantPortal;
  followUpInput.value = application.followUpDate;
  detailsInput.value = application.details;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function buildApplicationCard(application, { compact = false, draggable = false } = {}) {
  const node = cardTemplate.content.cloneNode(true);
  const card = node.querySelector(".application-card");
  const company = node.querySelector(".company");
  const position = node.querySelector(".position");
  const statusPill = node.querySelector(".status-pill");
  const applied = node.querySelector(".date-applied");
  const followUp = node.querySelector(".follow-up-date");
  const details = node.querySelector(".details");
  const portalLink = node.querySelector(".portal-link");
  const editBtn = node.querySelector(".edit-btn");
  const deleteBtn = node.querySelector(".delete-btn");
  const statusSelect = node.querySelector(".status-select");

  company.textContent = application.companyName;
  position.textContent = application.appliedPosition;
  statusPill.textContent = application.applicationStatus;
  statusPill.dataset.status = application.applicationStatus;
  applied.textContent = formatDate(application.dateApplied);
  followUp.textContent = formatDate(application.followUpDate);
  details.textContent = application.details || "No extra details yet.";
  statusSelect.value = application.applicationStatus;

  if (application.applicantPortal) {
    portalLink.href = application.applicantPortal;
  } else {
    portalLink.removeAttribute("href");
    portalLink.textContent = "Portal link not added";
    portalLink.classList.add("disabled-link");
  }

  statusSelect.addEventListener("change", (event) => {
    updateApplicationStatus(application.id, event.target.value);
  });

  editBtn.addEventListener("click", () => populateForm(application));
  deleteBtn.addEventListener("click", () => {
    const shouldDelete = window.confirm(
      `${application.companyName} kaydini silmek istedigine emin misin?`,
    );

    if (!shouldDelete) {
      return;
    }

    applications = applications.filter((item) => item.id !== application.id);
    saveApplications();
    renderApplications();
  });

  if (compact) {
    card.classList.add("kanban-card");
  }

  if (draggable) {
    card.setAttribute("draggable", "true");
    card.addEventListener("dragstart", (event) => {
      event.dataTransfer?.setData("text/plain", application.id);
    });
  }

  card.dataset.id = application.id;
  return node;
}

function renderEmptyState(container) {
  const emptyState = document.createElement("div");
  emptyState.className = "empty-state";
  emptyState.textContent =
    "Henuz goruntulenecek bir kayit yok. Yeni bir basvuru ekleyebilir veya sample data yukleyebilirsin.";
  container.appendChild(emptyState);
}

function renderGridView(filteredApplications) {
  applicationsGrid.innerHTML = "";

  if (!filteredApplications.length) {
    renderEmptyState(applicationsGrid);
    return;
  }

  filteredApplications.forEach((application) => {
    applicationsGrid.appendChild(buildApplicationCard(application));
  });
}

function renderKanbanView(filteredApplications) {
  kanbanBoard.innerHTML = "";

  if (!filteredApplications.length) {
    renderEmptyState(kanbanBoard);
    return;
  }

  STATUSES.forEach((status) => {
    const column = document.createElement("section");
    column.className = "kanban-column";
    column.dataset.status = status;

    const statusCount = filteredApplications.filter(
      (application) => application.applicationStatus === status,
    ).length;

    column.innerHTML = `
      <div class="kanban-column-header">
        <div>
          <h3>${status}</h3>
          <p>${statusCount} item</p>
        </div>
        <span class="status-pill" data-status="${status}">${status}</span>
      </div>
      <div class="kanban-list"></div>
    `;

    const list = column.querySelector(".kanban-list");

    filteredApplications
      .filter((application) => application.applicationStatus === status)
      .forEach((application) => {
        list.appendChild(buildApplicationCard(application, { compact: true, draggable: true }));
      });

    column.addEventListener("dragover", (event) => {
      event.preventDefault();
      column.classList.add("is-over");
    });

    column.addEventListener("dragleave", () => {
      column.classList.remove("is-over");
    });

    column.addEventListener("drop", (event) => {
      event.preventDefault();
      column.classList.remove("is-over");
      const draggedId = event.dataTransfer?.getData("text/plain");

      if (!draggedId) {
        return;
      }

      updateApplicationStatus(draggedId, status);
    });

    kanbanBoard.appendChild(column);
  });
}

function updateViewControls() {
  const isGridView = currentView === "grid";
  applicationsGrid.classList.toggle("hidden", !isGridView);
  kanbanBoard.classList.toggle("hidden", isGridView);
  gridViewBtn.classList.toggle("is-active", isGridView);
  kanbanViewBtn.classList.toggle("is-active", !isGridView);
}

function renderApplications() {
  const filteredApplications = getFilteredApplications();
  resultsSummary.textContent = `${filteredApplications.length} application shown`;
  updateViewControls();
  renderGridView(filteredApplications);
  renderKanbanView(filteredApplications);
  updateStats();
}

function buildApplicationFromForm() {
  return {
    id: editingIdInput.value || crypto.randomUUID(),
    companyName: companyInput.value.trim(),
    appliedPosition: positionInput.value.trim(),
    dateApplied: dateAppliedInput.value,
    applicationStatus: statusInput.value,
    applicantPortal: portalInput.value.trim(),
    followUpDate: followUpInput.value,
    details: detailsInput.value.trim(),
    createdAt: new Date().toISOString(),
  };
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const application = buildApplicationFromForm();
  const existingIndex = applications.findIndex((item) => item.id === application.id);

  if (existingIndex >= 0) {
    applications[existingIndex] = {
      ...applications[existingIndex],
      ...application,
    };
  } else {
    applications.unshift(application);
  }

  saveApplications();
  renderApplications();
  resetForm();
});

clearFormBtn.addEventListener("click", resetForm);

loadSampleBtn.addEventListener("click", () => {
  const shouldLoad = window.confirm(
    "Sample data yuklenirse mevcut kayitlarin korunacak, sadece ornek kayitlar eklenecek. Devam edilsin mi?",
  );

  if (!shouldLoad) {
    return;
  }

  const existingSignatures = new Set(
    applications.map((application) => `${application.companyName}-${application.appliedPosition}`),
  );

  const freshSamples = sampleApplications.filter(
    (application) =>
      !existingSignatures.has(`${application.companyName}-${application.appliedPosition}`),
  );

  applications = [...freshSamples, ...applications];
  saveApplications();
  renderApplications();
});

[searchInput, statusFilter, sortBySelect].forEach((element) => {
  element.addEventListener("input", renderApplications);
  element.addEventListener("change", renderApplications);
});

function downloadFile(content, fileName, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

exportBtn.addEventListener("click", () => {
  downloadFile(
    JSON.stringify(applications, null, 2),
    "internship-applications.json",
    "application/json",
  );
});

function toCsvValue(value) {
  const normalized = String(value ?? "").replaceAll('"', '""');
  return `"${normalized}"`;
}

exportCsvBtn.addEventListener("click", () => {
  const headers = [
    "companyName",
    "appliedPosition",
    "dateApplied",
    "applicationStatus",
    "applicantPortal",
    "followUpDate",
    "details",
  ];
  const rows = applications.map((application) =>
    headers.map((header) => toCsvValue(application[header])).join(","),
  );
  downloadFile(
    [headers.join(","), ...rows].join("\n"),
    "internship-applications.csv",
    "text/csv;charset=utf-8",
  );
});

importFileInput.addEventListener("change", async (event) => {
  const [file] = event.target.files || [];

  if (!file) {
    return;
  }

  try {
    const content = await file.text();
    const parsed = JSON.parse(content);

    if (!Array.isArray(parsed)) {
      throw new Error("Invalid data");
    }

    applications = parsed.filter((item) => item?.companyName && item?.appliedPosition);
    saveApplications();
    renderApplications();
    resetForm();
  } catch {
    window.alert("JSON dosyasi okunamadi. Gecerli bir export dosyasi sec.");
  } finally {
    importFileInput.value = "";
  }
});

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let isInsideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && isInsideQuotes && nextCharacter === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      isInsideQuotes = !isInsideQuotes;
      continue;
    }

    if (character === "," && !isInsideQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  values.push(current);
  return values;
}

function parseCsv(content) {
  const lines = content.split(/\r?\n/).filter((line) => line.trim());

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const entry = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));

    return {
      id: crypto.randomUUID(),
      companyName: entry.companyName?.trim() || "",
      appliedPosition: entry.appliedPosition?.trim() || "",
      dateApplied: entry.dateApplied?.trim() || "",
      applicationStatus: STATUSES.includes(entry.applicationStatus?.trim())
        ? entry.applicationStatus.trim()
        : "Wishlist",
      applicantPortal: entry.applicantPortal?.trim() || "",
      followUpDate: entry.followUpDate?.trim() || "",
      details: entry.details?.trim() || "",
      createdAt: new Date().toISOString(),
    };
  });
}

importCsvFileInput.addEventListener("change", async (event) => {
  const [file] = event.target.files || [];

  if (!file) {
    return;
  }

  try {
    const content = await file.text();
    const parsed = parseCsv(content).filter((item) => item.companyName && item.appliedPosition);

    if (!parsed.length) {
      throw new Error("Invalid CSV");
    }

    applications = parsed;
    saveApplications();
    renderApplications();
    resetForm();
  } catch {
    window.alert("CSV dosyasi okunamadi. Export edilen formatta bir dosya sec.");
  } finally {
    importCsvFileInput.value = "";
  }
});

gridViewBtn.addEventListener("click", () => {
  currentView = "grid";
  renderApplications();
});

kanbanViewBtn.addEventListener("click", () => {
  currentView = "kanban";
  renderApplications();
});

resetForm();
renderApplications();
