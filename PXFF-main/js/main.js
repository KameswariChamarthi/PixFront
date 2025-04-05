const backendUrl ="https://web-production-7d67.up.railway.app/";
/*=========
====== SHOW MENU ===============*/
const showMenu = (toggleId, navId) => {
    const toggle = document.getElementById(toggleId),
          nav = document.getElementById(navId);

    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            nav.classList.toggle('show-menu');
            toggle.classList.toggle('show-icon');
        });
    }
};

showMenu('nav-toggle', 'nav-menu');

/*=============== SHOW DROPDOWN MENU ===============*/
const dropdownItems = document.querySelectorAll('.dropdown__item');

dropdownItems.forEach((item) => {
    const dropdownButton = item.querySelector('.dropdown__button');

    dropdownButton.addEventListener("click", () => {
        const showDropdown = document.querySelector(".show-dropdown");

        toggleItem(item);

        if (showDropdown && showDropdown !== item) {
            toggleItem(showDropdown);
        }
    });
});

const toggleItem = (item) => {
    const dropdownContainer = item.querySelector(".dropdown__container");

    if (item.classList.contains("show-dropdown")) {
        dropdownContainer.removeAttribute("style");
        item.classList.remove("show-dropdown");
    } else {
        dropdownContainer.style.height = dropdownContainer.scrollHeight + "px";
        item.classList.add("show-dropdown");
    }
};

/*=============== DELETE DROPDOWN STYLES ===============*/
const mediaQuery = matchMedia("(min-width: 1118px)"),
      dropdownContainer = document.querySelectorAll(".dropdown__container");

const removeStyle = () => {
    if (mediaQuery.matches) {
        dropdownContainer.forEach((e) => e.removeAttribute("style"));
        dropdownItems.forEach((e) => e.classList.remove("show-dropdown"));
    }
};

addEventListener("resize", removeStyle);

/*=============== FILE UPLOAD LOGIC ===============*/
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
                detectDeepfake(file);  // 🚀 Call API before redirecting
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
    formData.append("image", file);  // "image" must match Flask API

    try {
        let response = await fetch("https://web-production-7d67.up.railway.app/detect-deepfake", { // <-- Updated URL
            method: "POST",
            body: formData
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        let data = await response.json();
        console.log("Deepfake Detection Result:", data);

        // Store API results for results page
        sessionStorage.setItem("isDeepfake", data.is_deepfake);
        sessionStorage.setItem("confidence", data.confidence);
        sessionStorage.setItem("processedImage", data.processed_image);

        // Redirect after receiving API response
        redirectToResultsPage();
    } catch (error) {
        console.error("API Error:", error);
        alert("⚠️ Deepfake detection failed. Please try again.");
    }
}


/*=============== REDIRECT TO RESULTS PAGE ===============*/
function redirectToResultsPage() {
    window.location.href = "resultspage.html";
}
