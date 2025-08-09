document.addEventListener('DOMContentLoaded', function() {
    const generatePdfBtn = document.getElementById('generatePdfBtn');
    const profilePictureInput = document.getElementById('profilePicture');
    const imagePreview = document.getElementById('imagePreview');

    // Show image preview when a file is selected
    profilePictureInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            }
            reader.readAsDataURL(file);
        }
    });

    generatePdfBtn.addEventListener('click', function() {
        // Check if form is valid
        const form = document.getElementById('profileForm');
        if (!form.checkValidity()) {
            alert('Please fill out all required fields.');
            form.reportValidity(); // This will highlight the invalid fields
            return;
        }

        // 1. GATHER DATA from the form
        const name = document.getElementById('firstName').value + ' ' + document.getElementById('surname').value;
        const nationality = document.getElementById('nationality').value;
        const passportId = document.getElementById('passportId').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;
        const qualifications = document.getElementById('qualifications').value;
        const branches = document.getElementById('branches').value;
        const talents = document.getElementById('talents').value;
        const profilePicSrc = imagePreview.src;

        // 2. POPULATE THE HIDDEN PDF TEMPLATE with the data
        document.getElementById('pdf-name').innerText = name;
        document.getElementById('pdf-nationality').innerText = nationality;
        document.getElementById('pdf-passportId').innerText = passportId;
        document.getElementById('pdf-phone').innerText = phone;
        document.getElementById('pdf-address').innerText = address;
        document.getElementById('pdf-qualifications').innerText = qualifications;
        document.getElementById('pdf-branches').innerText = branches;
        document.getElementById('pdf-talents').innerText = talents || 'N/A'; // Handle empty talents
        document.getElementById('pdf-img').src = profilePicSrc;
        document.getElementById('pdf-date').innerText = new Date().toLocaleDateString();

        // 3. USE HTML2CANVAS AND JSPDF TO GENERATE THE PDF
        const { jsPDF } = window.jspdf;
        const content = document.getElementById('pdf-content');
        
        // Temporarily make the content visible for html2canvas to capture it
        content.style.display = 'block';

        html2canvas(content, {
            scale: 2, // Increase scale for better quality
            useCORS: true // Important for images
        }).then(canvas => {
            // Hide the content again after capture
            content.style.display = 'none';

            const imgData = canvas.toDataURL('image/png');
            
            // A4 paper size: 210x297mm
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            // Generate a filename
            const fileName = `Profile-${document.getElementById('surname').value}-${document.getElementById('firstName').value}.pdf`;
            
            pdf.save(fileName);
        });
    });
});
