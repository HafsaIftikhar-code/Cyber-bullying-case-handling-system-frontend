// API BASE URL
const API_BASE = 'http://localhost:8081/api';

// SELECTED SEVERITY - Default to MILD
let selectedSeverity = "MILD";

// CLOSE FORM FUNCTION
function closeForm() {
    // Hide the overlay/form
    const overlay = document.querySelector('.overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
    // Or redirect to user.html
    // window.location.href = 'user.html';
}

// SEVERITY BUTTON TOGGLE
function initializeSeverityButtons() {
    document.querySelectorAll(".sev").forEach(btn => {
        btn.addEventListener("click", () => {
            // Remove active class from all buttons
            document.querySelectorAll(".sev").forEach(b => b.classList.remove("active"));
            // Add active class to clicked button
            btn.classList.add("active");
            // Update selected severity
            selectedSeverity = btn.dataset.level;
            // Update severity info
            updateSeverityInfo(selectedSeverity);
            console.log("Selected severity:", selectedSeverity);
        });
    });
}

// UPDATE SEVERITY INFO DISPLAY
function updateSeverityInfo(severity) {
    const infoElement = document.getElementById('severity-info');
    if (infoElement) {
        const descriptions = {
            'MILD': 'Minor harassment or discomfort',
            'MODERATE': 'Moderate impact on well-being',
            'CRITICAL': 'Severe harassment requiring immediate attention'
        };
        infoElement.innerHTML = `<small style="color: #64748b;">Selected: <strong>${severity}</strong> - ${descriptions[severity]}</small>`;
    }
}

// CLOSE BUTTON EVENT LISTENER
function initializeCloseButton() {
    const closeButton = document.querySelector('.header-icon');
    if (closeButton) {
        closeButton.addEventListener('click', closeForm);
        closeButton.style.cursor = 'pointer';
    }
}

// QUEUE REPORT FUNCTION - CONNECTED TO BACKEND
async function queueReport() {
    const name = document.getElementById("name").value.trim();
    const platform = document.getElementById("platform").value;
    const evidence = document.getElementById("evidence").value.trim();

    // Enhanced validation
    if (!name) {
        alert("❌ Please enter your full name");
        document.getElementById("name").focus();
        return;
    }

    if (!evidence) {
        alert("❌ Please provide narrative evidence");
        document.getElementById("evidence").focus();
        return;
    }

    // Show loading state
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                platform: platform,
                severity: selectedSeverity,
                description: evidence
            })
        });

        if (response.ok) {
            alert(`✅ REPORT SUBMITTED SUCCESSFULLY\nSeverity: ${selectedSeverity}\n\nThe report has been queued for review.`);
            // Reset form
            document.getElementById("name").value = "";
            document.getElementById("evidence").value = "";
            // Reset severity to default
            selectedSeverity = "MILD";
            document.querySelectorAll(".sev").forEach(b => b.classList.remove("active"));
            document.querySelector('.sev[data-level="MILD"]').classList.add("active");
            updateSeverityInfo("MILD");
            updateQueueCounts();
        } else {
            const errorText = await response.text();
            alert(`❌ Error submitting report: ${errorText}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Network error. Please check if backend is running.');
    } finally {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// UPDATE QUEUE COUNTS FROM BACKEND
async function updateQueueCounts() {
    try {
        const response = await fetch(`${API_BASE}/reports`);
        if (response.ok) {
            const reports = await response.json();

            // Count critical vs non-critical reports
            const criticalCount = reports.filter(r => r.severity === 'CRITICAL').length;
            const normalCount = reports.filter(r => r.severity !== 'CRITICAL').length;

            // Update UI elements with proper IDs
            const pQueueElement = document.getElementById('p-queue-count');
            const fifoElement = document.getElementById('fifo-count');
            const historyElement = document.getElementById('history-count');

            if (pQueueElement) pQueueElement.textContent = `P-Queue: ${criticalCount}`;
            if (fifoElement) fifoElement.textContent = `FIFO: ${normalCount}`;
            if (historyElement) historyElement.textContent = `History: ${reports.length}`;

            // Update dashboard with reports
            displayReportsDashboard(reports);
            displayQueueLists(reports);
        }
    } catch (error) {
        console.error('Error updating queue counts:', error);
    }
}

// PULL NEXT CASE FUNCTION
async function pullNextCase() {
    try {
        const response = await fetch(`${API_BASE}/next`);
        if (response.ok) {
            const report = await response.json();
            if (report) {
                // Display case details in the admin dashboard
                displayPulledCase(report);
                updateQueueCounts();
                return report;
            } else {
                alert('📭 No cases available in queue');
                hidePulledCase();
            }
        } else if (response.status === 204) {
            alert('📭 No cases available in queue');
            hidePulledCase();
        } else {
            alert('❌ Error pulling next case');
            hidePulledCase();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Network error. Please check if backend is running.');
        hidePulledCase();
    }
    return null;
}

// DISPLAY PULLED CASE IN DASHBOARD
function displayPulledCase(report) {
    const displayElement = document.getElementById('next-case-display');
    const contentElement = document.getElementById('next-case-content');

    if (displayElement && contentElement) {
        contentElement.innerHTML = `
            <div style="background: white; padding: 15px; border-radius: 8px; border: 2px solid ${report.severity === 'CRITICAL' ? '#ef4444' : report.severity === 'MODERATE' ? '#f59e0b' : '#10b981'};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h4 style="margin: 0; color: ${report.severity === 'CRITICAL' ? '#dc2626' : report.severity === 'MODERATE' ? '#d97706' : '#059669'};">
                        🎯 Case #${report.caseId} - ${report.severity}
                    </h4>
                    <button onclick="hidePulledCase()" style="background: #6c757d; color: white; border: none; border-radius: 3px; padding: 3px 8px; cursor: pointer; font-size: 12px;">✕</button>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                    <div><strong>👤 Name:</strong> ${report.name}</div>
                    <div><strong>🌐 Platform:</strong> ${report.platform}</div>
                </div>
                <div>
                    <strong>📝 Description:</strong>
                    <div style="margin-top: 5px; padding: 10px; background: #f8f9fa; border-radius: 5px; border-left: 3px solid #007bff;">
                        ${report.description}
                    </div>
                </div>
                <div style="margin-top: 15px; display: flex; gap: 10px;">
                    <button onclick="resolveCase(${report.caseId})" style="padding: 8px 15px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">✅ Mark Resolved</button>
                    <button onclick="deleteReport(${report.caseId})" style="padding: 8px 15px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">🗑️ Delete Case</button>
                </div>
            </div>
        `;
        displayElement.style.display = 'block';
    }
}

// HIDE PULLED CASE DISPLAY
function hidePulledCase() {
    const displayElement = document.getElementById('next-case-display');
    if (displayElement) {
        displayElement.style.display = 'none';
    }
}

// RESOLVE CASE (MARK AS HANDLED)
function resolveCase(caseId) {
    if (confirm('Mark this case as resolved?')) {
        // For now, just hide the display and refresh
        hidePulledCase();
        updateQueueCounts();
        alert('✅ Case marked as resolved');
    }
}

// LOAD ALL REPORTS
async function loadAllReports() {
    try {
        const response = await fetch(`${API_BASE}/reports`);
        if (response.ok) {
            const reports = await response.json();
            displayReports(reports);
        }
    } catch (error) {
        console.error('Error loading reports:', error);
    }
}

// REFRESH DASHBOARD
function refreshDashboard() {
    updateQueueCounts();
    loadAllReports();
}

// DISPLAY REPORTS DASHBOARD
function displayReportsDashboard(reports) {
    const dashboardElement = document.getElementById('reports-dashboard');
    if (!dashboardElement) return;

    if (reports.length === 0) {
        dashboardElement.innerHTML = '<p class="muted">No reports submitted yet</p>';
        return;
    }

    // Group reports by severity
    const criticalReports = reports.filter(r => r.severity === 'CRITICAL');
    const moderateReports = reports.filter(r => r.severity === 'MODERATE');
    const mildReports = reports.filter(r => r.severity === 'MILD');

    dashboardElement.innerHTML = `
        <div style="display: flex; gap: 15px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 120px; padding: 10px; background: #fee2e2; border-radius: 8px; border-left: 4px solid #ef4444;">
                <h4 style="margin: 0; color: #dc2626;">🔴 Critical</h4>
                <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #dc2626;">${criticalReports.length}</p>
            </div>
            <div style="flex: 1; min-width: 120px; padding: 10px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <h4 style="margin: 0; color: #d97706;">🟡 Moderate</h4>
                <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #d97706;">${moderateReports.length}</p>
            </div>
            <div style="flex: 1; min-width: 120px; padding: 10px; background: #d1fae5; border-radius: 8px; border-left: 4px solid #10b981;">
                <h4 style="margin: 0; color: #059669;">🟢 Mild</h4>
                <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #059669;">${mildReports.length}</p>
            </div>
        </div>
        <div style="margin-top: 15px;">
            <h4 style="margin-bottom: 10px;">Recent Reports:</h4>
            <div style="max-height: 150px; overflow-y: auto;">
                ${reports.slice(-5).reverse().map(report => `
                    <div style="padding: 8px; margin: 5px 0; background: #f8f9fa; border-radius: 5px; cursor: pointer;" onclick="showReportDetails(${report.caseId})">
                        <strong>ID: ${report.caseId}</strong> | ${report.name} | ${report.severity} | ${report.platform}
                        <br><small style="color: #666;">${report.description.substring(0, 60)}...</small>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// DISPLAY QUEUE LISTS
function displayQueueLists(reports) {
    const priorityList = document.getElementById('priority-queue-list');
    const standardList = document.getElementById('standard-queue-list');

    const criticalReports = reports.filter(r => r.severity === 'CRITICAL');
    const normalReports = reports.filter(r => r.severity !== 'CRITICAL');

    if (priorityList) {
        if (criticalReports.length === 0) {
            priorityList.innerHTML = '<small class="muted">No priority cases</small>';
        } else {
            priorityList.innerHTML = criticalReports.map(report => `
                <div style="padding: 5px; margin: 3px 0; background: #fee2e2; border-radius: 3px; font-size: 12px;">
                    <strong>${report.caseId}</strong>: ${report.name} (${report.platform})
                </div>
            `).join('');
        }
    }

    if (standardList) {
        if (normalReports.length === 0) {
            standardList.innerHTML = '<small class="muted">No standard cases</small>';
        } else {
            standardList.innerHTML = normalReports.map(report => `
                <div style="padding: 5px; margin: 3px 0; background: #dbeafe; border-radius: 3px; font-size: 12px;">
                    <strong>${report.caseId}</strong>: ${report.name} (${report.platform})
                </div>
            `).join('');
        }
    }
}

// SHOW REPORT DETAILS
function showReportDetails(caseId) {
    fetch(`${API_BASE}/reports/${caseId}`)
        .then(response => response.json())
        .then(report => {
            const detailsElement = document.getElementById('detailed-reports');
            if (detailsElement) {
                detailsElement.innerHTML = `
                    <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #007bff;">
                        <h4 style="margin: 0 0 10px 0; color: #333;">Report Details - Case #${report.caseId}</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                            <div><strong>Name:</strong> ${report.name}</div>
                            <div><strong>Platform:</strong> ${report.platform}</div>
                            <div><strong>Severity:</strong>
                                <span style="color: ${report.severity === 'CRITICAL' ? '#dc2626' : report.severity === 'MODERATE' ? '#d97706' : '#059669'}; font-weight: bold;">
                                    ${report.severity}
                                </span>
                            </div>
                            <div><strong>Case ID:</strong> ${report.caseId}</div>
                        </div>
                        <div style="margin-top: 15px;">
                            <strong>Description:</strong><br>
                            <div style="margin-top: 5px; padding: 10px; background: white; border-radius: 5px; border: 1px solid #dee2e6;">
                                ${report.description}
                            </div>
                        </div>
                        <div style="margin-top: 15px; display: flex; gap: 10px;">
                            <button onclick="deleteReport(${report.caseId})" style="padding: 5px 10px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;">Delete Report</button>
                        </div>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error loading report details:', error);
            alert('Error loading report details');
        });
}

// DELETE REPORT
async function deleteReport(id) {
    if (!confirm(`Are you sure you want to delete report ${id}?`)) return;

    try {
        const response = await fetch(`${API_BASE}/reports/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('✅ Report deleted successfully');
            updateQueueCounts();
            loadAllReports();
        } else {
            alert('❌ Error deleting report');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Network error');
    }
}

// INITIALIZE WHEN PAGE LOADS
document.addEventListener('DOMContentLoaded', function() {
    // Initialize severity buttons (for form page)
    initializeSeverityButtons();

    // Initialize close button (for form page)
    initializeCloseButton();

    // Update queue counts and load reports (for admin page)
    updateQueueCounts();
    loadAllReports();

    // Add event listeners for admin buttons
    const pullButton = document.querySelector('.btn:contains("Pull Next")');
    if (pullButton) {
        pullButton.addEventListener('click', pullNextCase);
    }
});
