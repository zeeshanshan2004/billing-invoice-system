document.addEventListener('DOMContentLoaded', function () {
  const darkModeToggle = document.getElementById('darkModeToggle');
  const body = document.body;

  // Load dark mode
  const isDarkMode = localStorage.getItem('darkMode') === 'enabled';
  if (isDarkMode) {
      body.classList.add('dark-mode');
      darkModeToggle.checked = true;
  }

  darkModeToggle.addEventListener('change', function () {
      body.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', this.checked ? 'enabled' : 'disabled');
  });

  const customerNameInput = document.getElementById('customerName');
  const primaryItemInput = document.getElementById('primaryItem');
  const invoiceDateInput = document.getElementById('invoiceDate');

  // Only load saved customer if fields are empty
  const savedCustomer = localStorage.getItem('customerInfo');
  if (savedCustomer) {
      const data = JSON.parse(savedCustomer);
      if (!customerNameInput.value) customerNameInput.value = data.name || '';
      if (!primaryItemInput.value) primaryItemInput.value = data.primaryItem || '';
      if (!invoiceDateInput.value) invoiceDateInput.value = data.invoiceDate || '';
  }

  // Load saved prescription
  const savedPrescription = localStorage.getItem('prescription');
  if (savedPrescription) {
      const data = JSON.parse(savedPrescription);
      document.getElementById('displayRightEyePower').textContent = data.rightEyePower || '-';
      document.getElementById('displayLeftEyePower').textContent = data.leftEyePower || '-';
      document.getElementById('displayLensType').textContent = data.lensType || '-';
      document.getElementById('displayPrescriptionNotes').textContent = data.additionalNotes || '-';
  }

  window.addItem = function () {
      let table = document.getElementById("invoiceItems");
      let row = table.insertRow();
      row.innerHTML = `
          <td><input type="text" class="form-control description" placeholder="Item name"></td>
          <td><input type="number" class="form-control quantity" value="1" min="1" oninput="calculateTotal()"></td>
          <td><input type="number" class="form-control unitPrice" value="0" min="0" oninput="calculateTotal()"></td>
          <td class="totalPrice">0.00</td>
          <td><button class="btn btn-danger" onclick="window.removeItem(this)">Remove</button></td>
      `;
      calculateTotal();
  };

  window.removeItem = function (button) {
      button.closest('tr').remove();
      calculateTotal();
  };

  window.calculateTotal = function () {
      let totalAmount = 0;

      document.querySelectorAll("#invoiceItems tr").forEach(row => {
          let quantity = parseInt(row.querySelector(".quantity")?.value) || 0;
          let unitPrice = parseFloat(row.querySelector(".unitPrice")?.value) || 0;
          let total = quantity * unitPrice;

          row.querySelector(".totalPrice").textContent = total.toFixed(2);
          totalAmount += total;
      });

      const totalAmountElem = document.getElementById("totalAmount");
      const totalContainer = document.getElementById("totalContainer");

      if (totalAmount > 0) {
          totalContainer.style.display = 'block';
      } else {
          totalContainer.style.display = 'none';
      }

      totalAmountElem.textContent = totalAmount.toFixed(2);
  };

  window.generateInvoice = function () {
      let customerName = customerNameInput.value.trim();
      let primaryItem = primaryItemInput.value.trim();
      let invoiceDate = invoiceDateInput.value;
      const prescriptionData = savedPrescription ? JSON.parse(savedPrescription) : null;

      if (!customerName || !primaryItem || !invoiceDate) {
          alert("⚠ Please fill all fields!");
          return;
      }

      const invoiceData = {
          name: customerName,
          cell: primaryItem,
          invoiceDate,
          items: getInvoiceItems(),
          totalAmount: parseFloat(document.getElementById("totalAmount").textContent) || 0,
          prescription: prescriptionData
      };

      // Save current info before generating
      localStorage.setItem('customerInfo', JSON.stringify({
          name: customerName,
          primaryItem: primaryItem,
          invoiceDate: invoiceDate
      }));

      fetch("http://localhost:3000/save-customer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(invoiceData)
      })
      .then(res => res.json())
      .then(data => {
          if (data.error) {
              alert("❌ Error: " + data.error);
          } else {
              alert("✅ Invoice Saved Successfully!");
              localStorage.removeItem('prescription');
              localStorage.removeItem('customerInfo');

              // Clear fields
              customerNameInput.value = '';
              primaryItemInput.value = '';
              invoiceDateInput.value = '';

              // Clear items
              document.getElementById("invoiceItems").innerHTML = '';
              calculateTotal();

              // Clear prescription display
              document.getElementById('displayRightEyePower').textContent = '-';
              document.getElementById('displayLeftEyePower').textContent = '-';
              document.getElementById('displayLensType').textContent = '-';
              document.getElementById('displayPrescriptionNotes').textContent = '-';
          }
      })
      .catch(error => {
          console.error("❌ Error:", error);
          alert("❌ Failed to save invoice.");
      });
  };

  window.getInvoiceItems = function () {
      let items = [];
      document.querySelectorAll("#invoiceItems tr").forEach(row => {
          let description = row.querySelector(".description")?.value.trim();
          let quantity = parseInt(row.querySelector(".quantity")?.value) || 0;
          let unitPrice = parseFloat(row.querySelector(".unitPrice")?.value) || 0;

          if (description && quantity > 0 && unitPrice >= 0) {
              items.push({ description, quantity, unitPrice });
          }
      });
      return items;
  };

  window.openHistory = function () {
      let primaryItem = primaryItemInput.value.trim();
      if (!primaryItem || isNaN(primaryItem)) {
          alert("⚠ Please enter a valid Primary Item (must be a number)!");
          return;
      }
      window.location.href = `history.html?query=${encodeURIComponent(primaryItem)}`;
  };

  window.saveBeforeEditPrescription = function () {
      const name = customerNameInput.value.trim();
      const primary = primaryItemInput.value.trim();
      const date = invoiceDateInput.value;

      localStorage.setItem('customerInfo', JSON.stringify({
          name,
          primaryItem: primary,
          invoiceDate: date
      }));

      window.location.href = "prescription.html";
  };
});
