
/* ==========================================
   SUBSTIBOT - COMPLETE FRONTEND JAVASCRIPT
   Demo prototype using localStorage
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    // --------------------------------------
    // 1. LOGIN AND PAGE PROTECTION
    // --------------------------------------

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const username =
                document.getElementById("username").value.trim();

            const password =
                document.getElementById("password").value;

            if (
                username === "admin" &&
                password === "SubstiBot@123"
            ) {
                sessionStorage.setItem("substiBotLoggedIn", "yes");
                window.location.href = "index.html";
            } else {
                alert("Invalid username or password!");
            }
        });

        return;
    }

    const currentPage = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();

    const publicPages = ["login.html"];

    if (
        !publicPages.includes(currentPage) &&
        sessionStorage.getItem("substiBotLoggedIn") !== "yes"
    ) {
        window.location.href = "login.html";
        return;
    }

    // --------------------------------------
    // 2. LOGOUT
    // --------------------------------------

    document.querySelectorAll("#logoutBtn, .logout-btn")
        .forEach(function (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();

                sessionStorage.removeItem("substiBotLoggedIn");
                window.location.href = "login.html";
            });
        });

    // --------------------------------------
    // 3. LOCAL STORAGE REQUEST FUNCTIONS
    // --------------------------------------

    const STORAGE_KEY = "substiBotDemoRequests";

    function getRequests() {
        try {
            const data = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );

            return Array.isArray(data) ? data : [];
        } catch (error) {
            return [];
        }
    }

    function saveRequests(requests) {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(requests)
        );
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (char) {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return entities[char];
        });
    }

    function statusClass(status) {
        const value = String(status || "Pending").toLowerCase();

        if (value === "approved") return "approved";
        if (value === "rejected") return "rejected";

        return "pending";
    }

    function renderRequestTable(tableId, requests) {
        const tbody = document.getElementById(tableId);

        if (!tbody) return;

        tbody.replaceChildren();

        if (requests.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 7;
            cell.textContent = "No substitution requests found.";
            cell.style.textAlign = "center";

            row.appendChild(cell);
            tbody.appendChild(row);
            return;
        }

        requests.forEach(function (request) {
            const row = document.createElement("tr");

            const values = [
                request.absent,
                request.className,
                request.subject,
                request.period,
                request.substitute || "Not assigned",
                request.status || "Pending"
            ];

            values.forEach(function (value) {
                const cell = document.createElement("td");
                cell.textContent = value || "-";
                row.appendChild(cell);
            });

            const actionCell = document.createElement("td");

            if (request.status === "Pending") {
                const approveButton = document.createElement("button");
                approveButton.type = "button";
                approveButton.textContent = "Approve";
                approveButton.className = "btn btn-primary";

                approveButton.addEventListener("click", function () {
                    updateRequestStatus(request.id, "Approved");
                });

                const rejectButton = document.createElement("button");
                rejectButton.type = "button";
                rejectButton.textContent = "Reject";
                rejectButton.className = "btn btn-danger";
                rejectButton.style.marginLeft = "6px";

                rejectButton.addEventListener("click", function () {
                    updateRequestStatus(request.id, "Rejected");
                });

                actionCell.append(approveButton, rejectButton);
            } else {
                actionCell.textContent = request.status;
            }

            row.appendChild(actionCell);
            tbody.appendChild(row);
        });
    }

    function updateRequestStatus(id, newStatus) {
        const requests = getRequests();

        const updated = requests.map(function (request) {
            if (String(request.id) === String(id)) {
                return { ...request, status: newStatus };
            }

            return request;
        });

        saveRequests(updated);
        refreshRequestTables();

        alert("Request status updated: " + newStatus);
    }

    function refreshRequestTables() {
        const requests = getRequests();

        renderRequestTable(
            "substitutionBody",
            requests
        );

        renderRequestTable(
            "approvalBody",
            requests.filter(function (request) {
                return request.status === "Pending";
            })
        );

        renderRequestTable(
            "historyBody",
            requests.filter(function (request) {
                return request.status !== "Pending";
            })
        );

        const requestCount = document.getElementById("requestCount");
        const pendingCount = document.getElementById("subPending");
        const approvedCount = document.getElementById("subApproved");

        if (requestCount) {
            requestCount.textContent = requests.length;
        }

        if (pendingCount) {
            pendingCount.textContent = requests.filter(function (request) {
                return request.status === "Pending";
            }).length;
        }

        if (approvedCount) {
            approvedCount.textContent = requests.filter(function (request) {
                return request.status === "Approved";
            }).length;
        }
    }

    refreshRequestTables();

    // --------------------------------------
    // 4. AUTOMATIC SUBSTITUTE RECOMMENDATION
    // --------------------------------------

    const facultyData = [
        {
            name: "Dr. Priya Kumar",
            subjects: ["Java", "Python"],
            availablePeriods: [
                "Period 1", "Period 2", "Period 3", "Period 4"
            ],
            classes: ["CSE II", "AI & DS II"],
            workload: 3
        },
        {
            name: "Ms. Divya S",
            subjects: ["Networks", "Python"],
            availablePeriods: [
                "Period 1", "Period 3", "Period 4"
            ],
            classes: ["IT III", "AI & DS II"],
            workload: 2
        },
        {
            name: "Mr. Bala K",
            subjects: ["Python", "Java"],
            availablePeriods: ["Period 2", "Period 3"],
            classes: ["CSE II", "AI & DS II"],
            workload: 4
        },
        {
            name: "Ms. Meena R",
            subjects: ["Networks"],
            availablePeriods: ["Period 1", "Period 2"],
            classes: ["IT III"],
            workload: 1
        },
        {
            name: "Mr. Arun",
            subjects: ["Java", "Networks"],
            availablePeriods: [
                "Period 1", "Period 2", "Period 3", "Period 4"
            ],
            classes: ["CSE II", "IT III"],
            workload: 2
        },
        {
            name: "Ms. Nisha",
            subjects: ["Python"],
            availablePeriods: ["Period 1", "Period 2", "Period 4"],
            classes: ["CSE II", "AI & DS II"],
            workload: 1
        }
    ];

    // Sample timetable conflicts for the demo
    const bookedPeriods = [
        { faculty: "Dr. Priya Kumar", period: "Period 2" },
        { faculty: "Ms. Divya S", period: "Period 3" },
        { faculty: "Mr. Bala K", period: "Period 2" }
    ];

    function findBestSubstitute(absent, className, subject, period) {
        return facultyData
            .filter(function (faculty) {
                return faculty.name !== absent;
            })
            .filter(function (faculty) {
                return faculty.subjects.includes(subject);
            })
            .filter(function (faculty) {
                return faculty.availablePeriods.includes(period);
            })
            .filter(function (faculty) {
                return faculty.classes.includes(className);
            })
            .filter(function (faculty) {
                return !bookedPeriods.some(function (booking) {
                    return (
                        booking.faculty === faculty.name &&
                        booking.period === period
                    );
                });
            })
            .sort(function (a, b) {
                return a.workload - b.workload;
            });
    }

    const substitutionForm =
        document.getElementById("substitutionForm");

    if (substitutionForm) {
        substitutionForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const formData = new FormData(substitutionForm);

            const absent = String(formData.get("absent") || "");
            const className = String(formData.get("className") || "");
            const subject = String(formData.get("subject") || "");
            const period = String(formData.get("period") || "");

            const result = document.getElementById("aiResult");
            const message = document.getElementById("aiMessage");
            const candidateList = document.getElementById("candidateList");

            if (!result || !message || !candidateList) {
                alert("Recommendation section is missing in substitution.html.");
                return;
            }

            const candidates = findBestSubstitute(
                absent,
                className,
                subject,
                period
            );

            result.hidden = false;
            candidateList.replaceChildren();

            if (candidates.length === 0) {
                message.textContent =
                    "No suitable substitute found. Please ask the HOD to review this class manually.";
                return;
            }

            message.textContent =
                "Suggested substitutes are ranked by subject, availability, class eligibility and workload. HOD approval is required.";

            candidates.forEach(function (faculty, index) {
                const card = document.createElement("div");
                card.className = "candidate-card";

                const title = document.createElement("h3");
                title.textContent =
                    (index === 0 ? "⭐ Best Match: " : "Suggested: ") +
                    faculty.name;

                const details = document.createElement("p");
                details.textContent =
                    "Subject: " + subject +
                    " | Class: " + className +
                    " | Period: " + period +
                    " | Workload: " + faculty.workload;

                const button = document.createElement("button");
                button.type = "button";
                button.className = "btn btn-primary";
                button.textContent = "Send Recommendation to HOD";

                button.addEventListener("click", function () {
                    const requests = getRequests();

                    const alreadyExists = requests.some(function (request) {
                        return (
                            request.absent === absent &&
                            request.className === className &&
                            request.subject === subject &&
                            request.period === period &&
                            request.status === "Pending"
                        );
                    });

                    if (alreadyExists) {
                        alert(
                            "A pending request already exists for this class and period."
                        );
                        return;
                    }

                    requests.unshift({
                        id: Date.now(),
                        absent: absent,
                        className: className,
                        subject: subject,
                        period: period,
                        substitute: faculty.name,
                        status: "Pending",
                        createdAt: new Date().toLocaleString()
                    });

                    saveRequests(requests);
                    refreshRequestTables();

                    button.disabled = true;
                    button.textContent = "Sent to HOD";

                    alert(
                        faculty.name +
                        " recommendation sent to the HOD Approval page."
                    );
                });

                card.append(title, details, button);
                candidateList.appendChild(card);
            });
        });
    }

    // --------------------------------------
    // 5. ATTENDANCE FILTER
    // --------------------------------------

    const attendanceSearch =
        document.getElementById("attendanceSearch");

    if (attendanceSearch) {
        attendanceSearch.addEventListener("input", function () {
            const searchText = attendanceSearch.value.toLowerCase();

            document.querySelectorAll(
                "#attendanceBody tr, .attendance-table tbody tr"
            ).forEach(function (row) {
                row.style.display =
                    row.textContent.toLowerCase().includes(searchText)
                        ? ""
                        : "none";
            });
        });
    }

    // --------------------------------------
    // 6. TIMETABLE FILTER
    // --------------------------------------

    const timetableFilter =
        document.getElementById("timetableFilter");

    if (timetableFilter) {
        timetableFilter.addEventListener("change", function () {
            const selectedClass = timetableFilter.value;

            document.querySelectorAll(
                "#timetableBody tr, .timetable-table tbody tr"
            ).forEach(function (row) {
                row.style.display =
                    !selectedClass ||
                    selectedClass === "All" ||
                    row.textContent.includes(selectedClass)
                        ? ""
                        : "none";
            });
        });
    }

    // --------------------------------------
    // 7. ADD TIMETABLE PERIOD
    // --------------------------------------

    const addPeriodForm =
        document.getElementById("addPeriodForm");

    if (addPeriodForm) {
        addPeriodForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const formData = new FormData(addPeriodForm);

            const className = String(
                formData.get("className") || ""
            );

            const period = String(
                formData.get("period") || ""
            );

            const subject = String(
                formData.get("subject") || ""
            );

            const faculty = String(
                formData.get("faculty") || ""
            );

            const tbody = document.getElementById("timetableBody");

            if (!tbody) {
                alert("Timetable table not found.");
                return;
            }

            const row = document.createElement("tr");

            [className, period, subject, faculty].forEach(function (value) {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            tbody.appendChild(row);
            addPeriodForm.reset();

            alert("Demo timetable period added.");
        });
    }

    // --------------------------------------
    // 8. EXPORT TABLE TO CSV
    // --------------------------------------

    document.querySelectorAll(
        "#exportCsvBtn, .export-csv-btn"
    ).forEach(function (button) {
        button.addEventListener("click", function () {
            const table =
                document.querySelector("#historyTable") ||
                document.querySelector(".data-table") ||
                document.querySelector("table");

            if (!table) {
                alert("No table available to export.");
                return;
            }

            const rows = Array.from(table.querySelectorAll("tr"));

            const csv = rows.map(function (row) {
                return Array.from(row.querySelectorAll("th, td"))
                    .map(function (cell) {
                        return '"' +
                            cell.innerText.replace(/"/g, '""') +
                            '"';
                    })
                    .join(",");
            }).join("\n");

            const blob = new Blob(
                ["\uFEFF" + csv],
                { type: "text/csv;charset=utf-8;" }
            );

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = "substiBot-history.csv";
            document.body.appendChild(link);
            link.click();
            link.remove();

            URL.revokeObjectURL(url);
        });
    });

});
