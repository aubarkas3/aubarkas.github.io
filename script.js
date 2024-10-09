
function handleSearch(event) {
    event.preventDefault(); // Prevents the form from actually submitting
    alert('Looking for your event'); // Displays the alert message
}
document.querySelectorAll('.button').forEach(button => {
    button.addEventListener('click', function(event) {
        event.preventDefault();
        window.location.href = this.href; // or other tracking functionality
    });
});

function toggleRows() {
    const rows = document.querySelectorAll('#myTable tbody tr');
    const viewMoreButton = document.getElementById('viewMore');
    // Check if the fifth row is visible
    if (rows[4].style.display === 'none' || rows[4].style.display === '') {
        // Make all rows visible
        rows.forEach(row => {
            row.style.display = 'table-row';
        });
        viewMoreButton.textContent = 'View Less';
    } else {
        // Hide all rows except the first four
        for (let i = 4; i < rows.length; i++) {
            rows[i].style.display = 'none';
        }
        viewMoreButton.textContent = 'View More';
    }
}