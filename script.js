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
            form.reportValidity();
            return;
        }

        // --- NATIVE PDF GENERATION SCRIPT ---

        // 1. GATHER DATA from the form
        const firstName = document.getElementById('firstName').value;
        const surname = document.getElementById('surname').value;
        const fullName = `${firstName} ${surname}`;
        const nationality = document.getElementById('nationality').value;
        const passportId = document.getElementById('passportId').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;
        const qualifications = document.getElementById('qualifications').value;
        const branches = document.getElementById('branches').value;
        const talents = document.getElementById('talents').value || 'N/A';
        const profilePicElement = document.getElementById('imagePreview');

        // 2. SETUP JSPDF DOCUMENT
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // --- PAGE LAYOUT CONSTANTS ---
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        const contentWidth = pageWidth - (margin * 2);
        const imageWidth = 50;
        const imageHeight = 60;
        const imageX = pageWidth - margin - imageWidth;
        const textStartX = margin;
        let currentY = margin + 5; // Start Y position

        // 3. ADD HEADER
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('Oxford International School Bishkek Teacher Card', pageWidth / 2, currentY, { align: 'center' });
        currentY += 8;
        doc.setLineWidth(0.5);
        doc.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 15;

        // 4. PROCESS AND ADD THE COMPRESSED IMAGE
        // This is the key step for file size reduction
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = 500; // Draw image onto a 500px wide canvas for compression
        tempCanvas.height = (profilePicElement.height / profilePicElement.width) * 500;
        tempCtx.drawImage(profilePicElement, 0, 0, tempCanvas.width, tempCanvas.height);
        const compressedImgData = tempCanvas.toDataURL('image/jpeg', 0.75); // Use JPEG format with 75% quality

        doc.addImage(compressedImgData, 'JPEG', imageX, currentY, imageWidth, imageHeight);

        // 5. ADD TEXT FIELDS
        const textBlockWidth = contentWidth - imageWidth - 10; // Width for text next to the image

        doc.setFontSize(12);
        doc.setFont('times', 'bold');
        doc.text('Name:', textStartX, currentY + 5);
        doc.setFont('times', 'normal');
        doc.text(fullName, textStartX + 40, currentY + 5);

        doc.setFont('times', 'bold');
        doc.text('Nationality:', textStartX, currentY + 15);
        doc.setFont('times', 'normal');
        doc.text(nationality, textStartX + 40, currentY + 15);

        doc.setFont('times', 'bold');
        doc.text('Passport ID:', textStartX, currentY + 25);
        doc.setFont('times', 'normal');
        doc.text(passportId, textStartX + 40, currentY + 25);

        doc.setFont('times', 'bold');
        doc.text('Phone Number:', textStartX, currentY + 35);
        doc.setFont('times', 'normal');
        doc.text(phone, textStartX + 40, currentY + 35);
        
        // Handle multi-line address
        doc.setFont('times', 'bold');
        doc.text('Address:', textStartX, currentY + 45);
        doc.setFont('times', 'normal');
        const addressLines = doc.splitTextToSize(address, textBlockWidth - 30); // Use a slightly smaller width
        doc.text(addressLines, textStartX + 40, currentY + 45);

        // Move Y position below the image for the rest of the content
        currentY += imageHeight + 15;

        // --- ADD FULL-WIDTH SECTIONS ---
        const addSection = (title, textContent) => {
            doc.setLineWidth(0.2);
            doc.line(margin, currentY - 5, pageWidth - margin, currentY - 5);
            currentY += 5;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.text(title, textStartX, currentY);
            currentY += 7;
            doc.setFont('times', 'normal');
            doc.setFontSize(12);
            const textLines = doc.splitTextToSize(textContent, contentWidth); // Use full content width
            doc.text(textLines, textStartX, currentY);
            currentY += (textLines.length * 5) + 5; // Adjust Y based on number of lines
        };
        
        addSection('Academic Qualifications', qualifications);
        addSection('Teaching Branches', branches);
        addSection('Extra Talents', talents);

        // 6. ADD FOOTER
        const today = new Date();
        const dateStr = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(150); // a lighter gray color
        doc.text(`Generated on ${dateStr} in Bishkek, Kyrgyzstan.`, margin, doc.internal.pageSize.getHeight() - 10);


        // 7. SAVE THE PDF
        const fileName = `Profile-${surname}-${firstName}.pdf`;
        doc.save(fileName);
    });
});
