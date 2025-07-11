// 1. Load locations on page load (for predict.html & compare.html)
function loadLocations() {
  $.get("/get_location_names", function(data) {
    if (data && data.locations) {
      const locations = data.locations;

      // For prediction page
      const uiLocations = document.getElementById("uiLocations");
      if (uiLocations) {
        locations.forEach(loc => uiLocations.append(new Option(loc)));
      }

      // For compare page
      const loc1 = document.getElementById("location1");
      const loc2 = document.getElementById("location2");
      if (loc1 && loc2) {
        locations.forEach(loc => {
          loc1.append(new Option(loc));
          loc2.append(new Option(loc));
        });
      }
    }
  });
}

// 2. Predict Price (used in predict.html)
function onClickedEstimatePrice() {
  const sqft = document.getElementById("uiSqft").value;
  const bhk = document.querySelector('input[name="uiBHK"]:checked')?.value;
  const bath = document.querySelector('input[name="uiBathrooms"]:checked')?.value;
  const location = document.getElementById("uiLocations").value;
  const resultEl = document.getElementById("uiEstimatedPrice");
  const noteEl = document.getElementById("affordable-note");
  const spinner = document.getElementById("spinner");

  if (!(sqft && bhk && bath && location)) {
    alert("Please fill in all details");
    return;
  }

  // Spinner
  if (spinner) spinner.style.display = "block";

  // Mini Info Box
  const miniInfo = document.getElementById("miniInfoBox");
  if (miniInfo) {
    miniInfo.style.display = "block";
    miniInfo.innerHTML =
      `<strong>Location:</strong> ${location}<br>
       <strong>Area:</strong> ${sqft} sqft<br>
       <strong>BHK:</strong> ${bhk} | <strong>Bath:</strong> ${bath}`;
  }

  // Predict API Call
  $.post("/predict_home_price", {
    total_sqft: parseFloat(sqft),
    bhk: parseInt(bhk),
    bath: parseInt(bath),
    location: location
  }, function(data) {
    if (spinner) spinner.style.display = "none";

    const price = data.estimated_price;
    resultEl.innerHTML = "₹ " + price + " Lakh";

    let note = "";
    if (price <= 40) note = "✅ This property is affordable.";
    else if (price <= 80) note = "💡 Moderately priced.";
    else note = "🔔 Premium / Luxury segment.";

    if (noteEl) noteEl.innerText = note;

    updateMapUsingGeocode(location);
  });
}

// 3. Compare Properties (used in compare.html)
function predictPrice(sqft, bhk, bath, location, callback) {
  $.post("/predict_home_price", {
    total_sqft: parseFloat(sqft),
    bhk: parseInt(bhk),
    bath: parseInt(bath),
    location: location
  }, function(data) {
    callback(data.estimated_price);
  });
}

function comparePrices() {
  const sqft1 = document.getElementById("sqft1").value;
  const bhk1 = document.getElementById("bhk1").value;
  const bath1 = document.getElementById("bath1").value;
  const location1 = document.getElementById("location1").value;

  const sqft2 = document.getElementById("sqft2").value;
  const bhk2 = document.getElementById("bhk2").value;
  const bath2 = document.getElementById("bath2").value;
  const location2 = document.getElementById("location2").value;

  if (!(sqft1 && bhk1 && bath1 && location1 && sqft2 && bhk2 && bath2 && location2)) {
    alert("Please fill all fields for both properties.");
    return;
  }

  predictPrice(sqft1, bhk1, bath1, location1, function(price1) {
    predictPrice(sqft2, bhk2, bath2, location2, function(price2) {
      const r1 = document.getElementById("result1");
      const r2 = document.getElementById("result2");
      const n1 = document.getElementById("note1");
      const n2 = document.getElementById("note2");

      r1.innerText = "₹ " + price1 + " Lakh";
      r2.innerText = "₹ " + price2 + " Lakh";
      n1.innerText = getAffordabilityNote(price1);
      n2.innerText = getAffordabilityNote(price2);

      r1.classList.remove("highlight");
      r2.classList.remove("highlight");

      if (price1 < price2) {
        r1.classList.add("highlight");
        alert("✅ Property 1 is more affordable by ₹" + (price2 - price1).toFixed(2) + " Lakh");
      } else if (price2 < price1) {
        r2.classList.add("highlight");
        alert("✅ Property 2 is more affordable by ₹" + (price1 - price2).toFixed(2) + " Lakh");
      } else {
        alert("Both properties are equally priced.");
      }
    });
  });
}

function getAffordabilityNote(price) {
  if (price <= 40) return "✅ Affordable";
  if (price <= 80) return "💡 Moderate";
  return "🔔 Premium / Luxury";
}

// 4. Dark Mode Toggle (all pages)
function setupDarkModeToggle() {
  const toggle = document.getElementById("darkToggle");
  if (toggle) {
    toggle.addEventListener("change", function () {
      document.body.classList.toggle("dark-mode", this.checked);
    });
  }
}

// 5. Navigation (used in index.html)
function navigateTo(page) {
  const spinner = document.getElementById("spinner");
  if (spinner) spinner.style.display = "block";
  setTimeout(() => {
    window.location.href = "/" + page;
  }, 1000);
}

// 6. Leaflet Map (used in predict.html)
let map, marker;

function initMap() {
  const mapContainer = document.getElementById("map");
  if (!mapContainer) return;

  map = L.map('map').setView([12.9716, 77.5946], 12); // Bangalore default
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
}

function updateMapUsingGeocode(locationName) {
  const mapContainer = document.getElementById("map");
  if (!mapContainer) return;

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName + ', Bangalore')}`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        if (marker) map.removeLayer(marker);
        marker = L.marker([lat, lon]).addTo(map).bindPopup(locationName).openPopup();
        map.setView([lat, lon], 15);
      }
    });
}

// 7. Initialize logic on load
window.onload = function () {
  setupDarkModeToggle();
  loadLocations();
  initMap();
};
