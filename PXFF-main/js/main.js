document.getElementById("browseBtn").addEventListener("click", function () {
    document.getElementById("fileInput").click();
});

document.getElementById("fileInput").addEventListener("change", function(event) {
    let file = event.target.files[0];

    if (!file) {
        return; // If no file is selected, exit
    }

    // Validate file type (supports only images now)
    const validTypes = ["image/"];
    if (!validTypes.some(type => file.type.startsWith(type))) {
        alert("❌ Please upload a valid image file.");
        return;
    }

    let reader = new FileReader();

    reader.onload = function(e) {
        let previewContainer = document.getElementById("preview-container");
        let progressContainer = document.querySelector(".progress-container");
        let progressBar = document.getElementById("progressBar");

        previewContainer.innerHTML = ""; // Clear previous preview

        if (file.type.startsWith("image/")) {
            let img = document.createElement("img");
            img.src = e.target.result;
            img.style.maxWidth = "100%";
            previewContainer.appendChild(img);
        }

        // Save file preview in session storage for results page
        sessionStorage.setItem("uploadedFile", e.target.result);
        sessionStorage.setItem("fileType", file.type);

        // Display progress bar
        progressContainer.style.display = "block";
        progressBar.style.width = "0%";

        let progress = 0;
        let interval = setInterval(() => {
            if (progress >= 100) {
                clearInterval(interval);
                detectDeepfake(file);  // Call API before redirecting
            } else {
                progress += 10;
                progressBar.style.width = progress + "%";
            }
        }, 200);
    };

    reader.readAsDataURL(file);
});

/*=============== SEND FILE TO FLASK API ===============*/
async function detectDeepfake(file) {
    let formData = new FormData();
    formData.append("file", file);  // Ensure this is "file" as per Flask API

    try {
        let response = await fetch("http://localhost:5000/detect-deepfake", { // Change this URL based on your server
            method: "POST",
            body: formData
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        let data = await response.json();
        console.log("Deepfake Detection Result:", data);

        if (data.error) {
            alert(data.error);
            return;
        }

        // Store API results for results page
        sessionStorage.setItem("isDeepfake", data.is_deepfake);
        sessionStorage.setItem("confidence", data.confidence);
        sessionStorage.setItem("processedImage", data.processed_image);

        // Redirect after receiving API response
        window.location.href = "resultspage.html";
    } catch (error) {
        console.error("API Error:", error);
        alert("⚠️ Deepfake detection failed. Please try again.");
    }
}
