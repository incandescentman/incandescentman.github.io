document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM fully loaded and parsed");

    fetch('progress.org')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            console.log("Fetched data successfully:");
            console.log(data);

            const lines = data.trim().split('\n');
            console.log(`Total lines: ${lines.length}`);

            const container = document.getElementById('daysContainer');
            let dayCount = 1;
            let currentMonth = '';

            lines.forEach((line, index) => {
                console.log(`Processing line ${index + 1}: ${line}`);
                const [status, dateInfo] = line.split(' ');
                const dateMatch = dateInfo.match(/<(\d{4}-\d{2}-\d{2}) (\w{3})>/);
                if (dateMatch) {
                    const [fullMatch, date, day] = dateMatch;
                    const dateObj = new Date(date);
                    const month = dateObj.toLocaleString('default', { month: 'long' });

                    const dayDiv = document.createElement('div');
                    dayDiv.classList.add('day');
                    dayDiv.setAttribute('data-date', date);

                    if (status === 'DONE') {
                        dayDiv.classList.add('completed');
                        dayDiv.innerHTML = `<span class="checkmark">✔</span><p>Day ${dayCount}: ${day} ${month} ${dateObj.getDate()}</p>`;
                    } else if (status === 'MISSED') {
                        dayDiv.classList.add('missed');
                        dayDiv.innerHTML = `<span class="empty-square">☒</span><p>Day ${dayCount}: ${day} ${month} ${dateObj.getDate()}</p>`;
                    } else {
                        dayDiv.innerHTML = `<span class="empty-square">☐</span><p>Day ${dayCount}: ${day} ${month} ${dateObj.getDate()}</p>`;
                    }

                    container.appendChild(dayDiv);
                    console.log(`Added day ${dayCount}`);

                    if ((index + 1) % 7 === 0 || index === lines.length - 1) {
                        const monthDiv = document.createElement('div');
                        monthDiv.classList.add('month');
                        monthDiv.textContent = month;
                        container.appendChild(monthDiv);
                    }

                    dayCount++;
                }
            });

            console.log("All days processed and added");
        })
        .catch(error => console.error('Error fetching org file:', error));
});
