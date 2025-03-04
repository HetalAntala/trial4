// Function to fetch feedback report
function fetchFeedbackReport() {
    const dateRange = document.getElementById('reviewDateRange').value;
    const rating = document.getElementById('reviewRatingFilter').value;
    let startDate, endDate;

    console.log(`Fetching feedback with Date Range: ${dateRange}, Rating: ${rating}`);

    const today = new Date();
    if (dateRange === 'today') {
        startDate = endDate = today.toISOString().split('T')[0];
    } else if (dateRange === 'last7days') {
        endDate = today.toISOString().split('T')[0];
        startDate = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
    } else if (dateRange === 'last30days') {
        endDate = today.toISOString().split('T')[0];
        startDate = new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0];
    } else if (dateRange === 'custom') {
        startDate = document.getElementById('reviewStartDate').value;
        endDate = document.getElementById('reviewEndDate').value;
        if (!startDate || !endDate) {
            alert('Please select both start and end dates.');
            return;
        }
    } else if (dateRange === 'all') {
        // Set a default date range to include older feedback (e.g., start from 2020)
        startDate = '2020-01-01';
        endDate = today.toISOString().split('T')[0];
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (rating) queryParams.append('rating', rating);

    console.log(`Query URL: /report/feedback-report?${queryParams.toString()}`);

    // Fetch feedback data
    fetch(`/report/feedback-report?${queryParams.toString()}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Feedback Report Data:", data);

            const tableBody = document.getElementById('review-table-body');
            tableBody.innerHTML = '';

            if (data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="7">No feedback found for the selected filters.</td></tr>';
                return;
            }

            data.forEach(feedback => {
                // Format the feedback date to show only YYYY-MM-DD
                const formattedDate = feedback.feedback_date.split('T')[0];

                const row = `
                    <tr>
                        <td>${feedback.feedback_id}</td>
                        <td>${feedback.customer_name}</td>
                        <td>${feedback.feedback_desc}</td>
                        <td>${formattedDate}</td>
                        <td>${feedback.product_id || 'N/A'}</td>
                        <td>${feedback.rating || 'N/A'}</td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        })
        .catch(error => {
            console.error('Error fetching feedback report:', error);
            alert('Failed to fetch feedback report. Please try again later.');
        });
}