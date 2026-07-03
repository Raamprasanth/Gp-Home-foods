
        // ══ Greeting & Date ════════════════════════════════════════════════════════════
        (function () {
            const now = new Date();
            const hour = now.getHours();
            const greet = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
            document.getElementById('greetTime').textContent = greet;
            document.getElementById('greetMsg').textContent = greet + ', Admin';

            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            document.getElementById('liveDate').textContent =
                `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
            
            // Set current month default
            document.getElementById('fMonth').value = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
        })();

        // ══ Tab Navigation ═════════════════════════════════════════════════════════════
        function switchTab(tab) {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelector(`.tab-btn[data-tab="${tab}"]`).classList.add('active');
            
            document.querySelectorAll('.tab-pane').forEach(pane => pane.style.display = 'none');
            document.getElementById('tab-' + tab).style.display = 'block';
        }

        // ══ Data State ════════════════════════════════════════════════════════════════
        let employees = [];
        let salaries = [];

        // ══ API Fetching ══════════════════════════════════════════════════════════════
        async function loadData() {
            try {
                const [empRes, salRes] = await Promise.all([
                    fetch('/api/employees'),
                    fetch('/api/salary')
                ]);
                employees = await empRes.json();
                salaries = await salRes.json();
                
                renderSalaries();
                renderHistory();
            } catch (err) {
                console.error("Failed to load data", err);
                showToast("Failed to load data");
            }
        }

        // ══ Rendering ═════════════════════════════════════════════════════════════════
        function renderSalaries() {
            const tbody = document.querySelector('#salariesTable tbody');
            let rows = '';

            const currentMonth = document.getElementById('fMonth').value || 
                `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`;

            if (employees.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No employees found. Add employees first.</td></tr>';
                return;
            }

            employees.forEach(e => {
                const salaryThisMonth = salaries.find(s => s.employeeId && s.employeeId.id === e.id && s.month === currentMonth);
                
                let statusBadge = '<span class="status-badge" style="background:#e0e0e0;color:#666;">Not Processed</span>';
                if (salaryThisMonth) {
                    const cls = salaryThisMonth.status === 'Paid' ? 'status-paid' : 'status-pending';
                    statusBadge = `<span class="status-badge ${cls}">${salaryThisMonth.status}</span>`;
                }

                rows += `
                <tr>
                    <td>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <span style="font-weight:700; color:var(--green);">${e.name}</span>
                        </div>
                    </td>
                    <td>${e.role}</td>
                    <td style="font-family:'JetBrains Mono',monospace;">₹${e.salary || 0}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-primary" style="padding:6px 12px; font-size:0.75rem;" onclick="openModal('${e.id}')">
                            Process
                        </button>
                    </td>
                </tr>`;
            });
            tbody.innerHTML = rows;
        }

        function renderHistory() {
            const tbody = document.querySelector('#historyTable tbody');
            let rows = '';

            if (salaries.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No salary records found.</td></tr>';
                return;
            }

            salaries.forEach(s => {
                const cls = s.status === 'Paid' ? 'status-paid' : 'status-pending';
                const empName = s.employeeId ? s.employeeId.name : 'Unknown';
                const dateStr = new Date(s.createdAt).toLocaleDateString();

                rows += `
                <tr>
                    <td>${dateStr}</td>
                    <td><strong style="color:var(--green)">${empName}</strong></td>
                    <td>${s.month}</td>
                    <td style="font-family:'JetBrains Mono',monospace;">₹${s.baseSalary}</td>
                    <td style="font-family:'JetBrains Mono',monospace; color:var(--teal);">+₹${s.bonus}</td>
                    <td style="font-family:'JetBrains Mono',monospace; color:var(--rose);">-₹${s.deductions}</td>
                    <td style="font-family:'JetBrains Mono',monospace; font-weight:bold;">₹${s.netSalary}</td>
                    <td><span class="status-badge ${cls}">${s.status}</span></td>
                </tr>`;
            });
            tbody.innerHTML = rows;
        }

        // ══ Modal Logic ═══════════════════════════════════════════════════════════════
        function openModal(empId) {
            const e = employees.find(x => x.id === empId);
            if (!e) return;

            document.getElementById('modalTitle').textContent = `Process Salary: ${e.name}`;
            document.getElementById('fEmpId').value = e.id;
            
            // Check if there is already a record for the current month
            const month = document.getElementById('fMonth').value;
            const existingRecord = salaries.find(s => s.employeeId && s.employeeId.id === e.id && s.month === month);
            
            if (existingRecord) {
                document.getElementById('fBase').value = existingRecord.baseSalary;
                document.getElementById('fBonus').value = existingRecord.bonus;
                document.getElementById('fDeductions').value = existingRecord.deductions;
                document.getElementById('fStatus').value = existingRecord.status;
            } else {
                document.getElementById('fBase').value = e.salary || 0;
                document.getElementById('fBonus').value = 0;
                document.getElementById('fDeductions').value = 0;
                document.getElementById('fStatus').value = 'Pending';
            }
            
            calcNet();
            
            document.getElementById('salaryModal').classList.add('open');
        }

        function closeModal() {
            document.getElementById('salaryModal').classList.remove('open');
        }

        function bdClose(e) {
            if (e.target === document.getElementById('salaryModal')) closeModal();
        }

        function calcNet() {
            const base = parseFloat(document.getElementById('fBase').value) || 0;
            const bonus = parseFloat(document.getElementById('fBonus').value) || 0;
            const deduc = parseFloat(document.getElementById('fDeductions').value) || 0;
            document.getElementById('fNet').value = base + bonus - deduc;
        }

        async function saveSalary() {
            const employeeId = document.getElementById('fEmpId').value;
            const month = document.getElementById('fMonth').value;
            const baseSalary = parseFloat(document.getElementById('fBase').value) || 0;
            const bonus = parseFloat(document.getElementById('fBonus').value) || 0;
            const deductions = parseFloat(document.getElementById('fDeductions').value) || 0;
            const status = document.getElementById('fStatus').value;

            if (!month) { showToast('Please select a month'); return; }

            const payload = { employeeId, month, baseSalary, bonus, deductions, status };

            // Check if we are updating or creating
            const existingRecord = salaries.find(s => s.employeeId && s.employeeId.id === employeeId && s.month === month);
            
            try {
                let res;
                if (existingRecord) {
                    res = await fetch('/api/salary/' + existingRecord.id, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                } else {
                    res = await fetch('/api/salary', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                }
                
                if (res.ok) {
                    showToast('Salary record saved successfully');
                    closeModal();
                    await loadData();
                } else {
                    const err = await res.json();
                    showToast('Error: ' + err.message);
                }
            } catch (err) {
                console.error(err);
                showToast('Failed to save record');
            }
        }

        // ══ Toast ═════════════════════════════════════════════════════════════════════
        let toastT;
        function showToast(msg) {
            const el = document.getElementById('toast');
            el.textContent = msg;
            el.classList.add('show');
            clearTimeout(toastT);
            toastT = setTimeout(() => el.classList.remove('show'), 2400);
        }

        // ══ Keyboard ══════════════════════════════════════════════════════════════════
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') closeModal();
        });

        // Initialize
        loadData();
    