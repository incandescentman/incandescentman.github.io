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
    const lines = orgModeData.trim().split('\n').filter(line => line.startsWith('*') && /<\d{4}-\d{2}-\d{2}/.test(line));
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    let currentRow;
    let dayCount = 0;

    lines.forEach((line, index) => {
        if (dayCount % 7 === 0) {
            currentRow = document.createElement('div');
            currentRow.className = 'week-row grid grid-cols-8 gap-4';
            container.appendChild(currentRow);
        }

        const dateMatch = line.match(/<(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
            const date = new Date(dateMatch[1] + 'T00:00:00'); // Add time to ensure consistent parsing
            if (isNaN(date.getTime())) {
                console.error(`Invalid date: ${dateMatch[1]}`);
                return;
            }

            const dayElement = document.createElement('div');
            dayElement.classList.add('day');
            dayElement.innerHTML = `<p class="full-date">${date.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>`;

            const status = line.split(' ')[1];
            if (status === 'DONE' || status === 'MISSED' || status === 'TODO') {
                dayCount++;
                dayElement.innerHTML += `<p class="day-number">Day ${dayCount}</p>`;

                const statusSymbol = status === 'DONE' ? '✔' : status === 'MISSED' ? '✘' : '☐';
                const statusClass = status.toLowerCase();
                dayElement.classList.add(statusClass);
                dayElement.innerHTML = `<span class="${statusClass}-symbol" aria-hidden="true">${statusSymbol}</span>` + dayElement.innerHTML;
                dayElement.setAttribute('aria-label', `${status} Day ${dayCount}`);
            }

            currentRow.appendChild(dayElement);

            if (dayCount % 7 === 0 || index === lines.length - 1) {
                const monthElement = document.createElement('div');
                monthElement.className = 'month-name p-4 border rounded bg-blue-100 flex items-center justify-center';
                monthElement.textContent = monthNames[date.getMonth()];
                currentRow.appendChild(monthElement);
            }
        }
    });
}
