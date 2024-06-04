document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('dayContainer');
    if (!container) {
        console.error("Container element not found!");
        return;
    }

    fetch('progress.org')
        .then(response => response.text())
        .then(data => processOrgModeData(data, container))
        .catch(error => console.error('Error fetching progress.org:', error));
});

function processOrgModeData(orgModeData, container) {
    const lines = orgModeData.trim().split('\n').filter(line => line.startsWith('*'));
    let weekRow = document.createElement('div');
    weekRow.classList.add('week-row');

    let dayCount = 0;
    let startDate = new Date(lines[0].match(/<(\d{4}-\d{2}-\d{2})/)[1]); // Get start date from first line

    while (startDate.getDay() !== 1) { // Ensure we start on Monday
        startDate.setDate(startDate.getDate() - 1);
    }

    for (let date = new Date(startDate); date <= new Date(lines[lines.length - 1].match(/<(\d{4}-\d{2}-\d{2})/)[1]); date.setDate(date.getDate() + 1)) {
        const dateString = date.toISOString().slice(0, 10); // YYYY-MM-DD format
        const line = lines.find(line => line.includes(dateString));

        const dayElement = document.createElement('div');
        dayElement.classList.add('day');
        dayElement.innerHTML = `<p class="full-date">${date.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>`;

        if (line) {
            const status = line.split(' ')[1];
            if (status === 'DONE' || status === 'MISSED' || status === 'TODO') {
                dayCount++;
                dayElement.innerHTML += `<p class="day-number">Day ${dayCount}</p>`;

                if (status === 'DONE') {
                    dayElement.classList.add('completed');
                    dayElement.innerHTML = `<span class="checkmark">✔</span>` + dayElement.innerHTML;
                } else if (status === 'MISSED') {
                    dayElement.classList.add('missed');
                    dayElement.innerHTML = `<span class="cross">✘</span>` + dayElement.innerHTML;
                } else if (status === 'TODO') {
                    dayElement.classList.add('todo');
                    dayElement.innerHTML = `<span class="empty-square">☐</span>` + dayElement.innerHTML;
                }
            }
        }

        weekRow.appendChild(dayElement);
        if (date.getDay() === 0) { // Sunday
            container.appendChild(weekRow);
            weekRow = document.createElement('div');
            weekRow.classList.add('week-row');
        }
    }

    if (weekRow.children.length > 0) { // Append any remaining days
        container.appendChild(weekRow);
    }
}
