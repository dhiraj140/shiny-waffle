// script.js – complete logic: pricing, discount, QR, unique ID, mass generation, localStorage anti‑copy integration

/******************** CONFIGURATION ********************/
const EVENT_NAME = "XYZ CONFERENCE";
const EVENT_SHORT = "XYZ";
const TICKET_PRICES = {
    PRIME: 15000,
    PLUS: 11000,
    ECONO: 2500
};

// DOM elements
const ticketTypeEl = document.getElementById('ticketType');
const basePriceEl = document.getElementById('basePrice');
const quantityEl = document.getElementById('quantity');
const discountTypeEl = document.getElementById('discountType');
const discountValueEl = document.getElementById('discountValue');
const generateBtn = document.getElementById('generateBtn');
const printBtn = document.getElementById('printBtn');
const pdfBtn = document.getElementById('pdfBtn');
const clearBtn = document.getElementById('clearBtn');
const ticketsContainer = document.getElementById('ticketsContainer');

// summary fields
const summaryType = document.getElementById('summaryType');
const summaryBase = document.getElementById('summaryBase');
const summaryQty = document.getElementById('summaryQty');
const summarySubtotal = document.getElementById('summarySubtotal');
const summaryDiscount = document.getElementById('summaryDiscount');
const summaryFinal = document.getElementById('summaryFinal');

// ---- INITIAL STATE ----
let currentTickets = [];   // store last generated tickets for print/pdf

/******************** UTILITIES ********************/
function formatINR(amount) {
    return '₹' + amount.toLocaleString('en-IN');
}

// enable/disable discount input based on type
function toggleDiscountInput() {
    const type = discountTypeEl.value;
    discountValueEl.disabled = (type === 'none');
    if (type === 'none') discountValueEl.value = 0;
}
discountTypeEl.addEventListener('change', toggleDiscountInput);
toggleDiscountInput(); // run on load

// update base price field when ticket type changes
function updateBasePrice() {
    const selected = ticketTypeEl.selectedOptions[0];
    const price = parseInt(selected.dataset.price, 10);
    basePriceEl.value = price;
}
ticketTypeEl.addEventListener('change', updateBasePrice);
updateBasePrice();

// ---- LIVE SUMMARY RECALC (without generating) ----
function computeSummary() {
    const base = parseInt(basePriceEl.value, 10);
    const qty = parseInt(quantityEl.value, 10);
    const subtotal = base * qty;
    const discountType = discountTypeEl.value;
    const discountVal = parseFloat(discountValueEl.value) || 0;

    let discountAmount = 0;
    if (discountType === 'flat') {
        discountAmount = Math.min(discountVal, subtotal); // cannot exceed subtotal
    } else if (discountType === 'percent') {
        discountAmount = subtotal * (Math.min(discountVal, 100) / 100);
    }
    discountAmount = Math.round(discountAmount); // whole rupees

    const finalTotal = subtotal - discountAmount;

    // update summary UI
    summaryType.innerText = ticketTypeEl.value;
    summaryBase.innerText = formatINR(base);
    summaryQty.innerText = qty;
    summarySubtotal.innerText = formatINR(subtotal);
    summaryDiscount.innerText = formatINR(discountAmount);
    summaryFinal.innerText = formatINR(finalTotal);
}

// listen to all changes that affect summary
[ticketTypeEl, quantityEl, discountTypeEl, discountValueEl].forEach(el => {
    el.addEventListener('input', computeSummary);
    el.addEventListener('change', computeSummary);
});
computeSummary(); // initial

/******************** TICKET GENERATION (CORE) ********************/
// generate unique ticket ID: TCKYYYY-SERIAL
let ticketCounter = 1000;
function generateUniqueTicketId(index) {
    const now = new Date();
    const year = now.getFullYear();
    const randomPart = Math.floor(Math.random() * 900 + 100); // 3 digits
    return `TCK${year}-${randomPart}${index}`;
}

// create QR code canvas from given text (using qrcode-generator)
function generateQRCodeCanvas(text) {
    const qr = qrcode(0, 'M'); // error correction M
    qr.addData(text);
    qr.make();
    const cellSize = 4; // size of each pixel
    const margin = 2;
    const canvas = document.createElement('canvas');
    const size = qr.getModuleCount() * cellSize + margin * 2;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    
    for (let row = 0; row < qr.getModuleCount(); row++) {
        for (let col = 0; col < qr.getModuleCount(); col++) {
            if (qr.isDark(row, col)) {
                ctx.fillRect(
                    col * cellSize + margin,
                    row * cellSize + margin,
                    cellSize,
                    cellSize
                );
            }
        }
    }
    return canvas;
}

// MAIN GENERATION FUNCTION
function generateTickets() {
    const basePrice = parseInt(basePriceEl.value, 10);
    const qty = parseInt(quantityEl.value, 10);
    const ticketType = ticketTypeEl.value;
    const discountType = discountTypeEl.value;
    const discountVal = parseFloat(discountValueEl.value) || 0;

    // --- recalc totals (same as summary) ---
    const subtotal = basePrice * qty;
    let totalDiscount = 0;
    if (discountType === 'flat') {
        totalDiscount = Math.min(discountVal, subtotal);
    } else if (discountType === 'percent') {
        totalDiscount = subtotal * (Math.min(discountVal, 100) / 100);
    }
    totalDiscount = Math.round(totalDiscount);
    const finalTotal = subtotal - totalDiscount;

    // --- per‑ticket discount distribution (integer rupees, fair spread) ---
    const perTicketBaseDiscount = Math.floor(totalDiscount / qty);
    let remainder = totalDiscount % qty;  // extra ₹1 to distribute

    const tickets = [];
    for (let i = 0; i < qty; i++) {
        // distribute remainder one by one
        const extra = remainder > 0 ? 1 : 0;
        remainder--;
        const perTicketDiscount = perTicketBaseDiscount + extra;
        const finalPrice = basePrice - perTicketDiscount;  // per ticket final

        // ---- unique ticket ID ----
        const ticketId = generateUniqueTicketId(i + 1);
        const serial = `${i+1}/${qty}`;

        // ---- QR content ----
        const timestamp = new Date().toISOString();
        const qrText = `EVENT=${EVENT_SHORT}|TYPE=${ticketType}|ID=${ticketId}|PRICE=${finalPrice}|TIME=${timestamp}`;

        // ---- discount label for ticket (human readable) ----
        let discountLabel = '';
        if (discountType === 'flat' && totalDiscount > 0) {
            discountLabel = `Flat ₹${totalDiscount} total · you save ₹${perTicketDiscount}`;
        } else if (discountType === 'percent' && totalDiscount > 0) {
            discountLabel = `${discountVal}% total · you save ₹${perTicketDiscount}`;
        } else {
            discountLabel = 'No discount';
        }

        tickets.push({
            index: i,
            ticketId,
            serial,
            basePrice,
            perTicketDiscount,
            finalPrice,
            discountLabel,
            qrText,
            timestamp,
            ticketType,
            eventName: EVENT_NAME
        });
    }

    currentTickets = tickets;
    renderTickets(tickets);
}

// RENDER all tickets into container
function renderTickets(tickets) {
    ticketsContainer.innerHTML = ''; // clear
    tickets.forEach(t => {
        const ticketDiv = document.createElement('div');
        ticketDiv.className = 'ticket';

        // QR canvas
        const qrCanvas = generateQRCodeCanvas(t.qrText);
        qrCanvas.classList.add('qr-canvas');

        // inner HTML structure
        ticketDiv.innerHTML = `
            <div class="ticket-header">
                <span>${t.ticketType}</span>
                <span class="ticket-id-sn">${t.ticketId}</span>
            </div>
            <div class="ticket-event">
                🎪 ${t.eventName} · ${t.serial}
            </div>
            <div class="ticket-details">
                <span>💰 Base: ${formatINR(t.basePrice)}</span>
                <span>🏷️ Discount: ${t.perTicketDiscount > 0 ? '₹'+t.perTicketDiscount : '₹0'} (${t.discountLabel})</span>
                <span>💎 Final: <strong style="font-size:1.2rem;">${formatINR(t.finalPrice)}</strong></span>
                <span>🆔 ID: ${t.ticketId}</span>
            </div>
            <div class="qr-container"></div>
            <div class="ticket-warning">
                ⚠️ Valid for single entry only. Duplicate tickets will be rejected.
            </div>
        `;

        // attach QR canvas
        ticketDiv.querySelector('.qr-container').appendChild(qrCanvas);
        ticketsContainer.appendChild(ticketDiv);
    });
}

// ----- GENERATE BUTTON -----
generateBtn.addEventListener('click', (e) => {
    e.preventDefault();
    generateTickets();
});

/******************** PRINT / PDF MASS ACTIONS ********************/
// PRINT: standard browser print with @media print styles
printBtn.addEventListener('click', () => {
    if (currentTickets.length === 0) {
        alert('Please generate tickets first.');
        return;
    }
    window.print();
});

// PDF using html2pdf (all tickets in one PDF)
pdfBtn.addEventListener('click', () => {
    if (currentTickets.length === 0) {
        alert('Generate tickets before saving PDF.');
        return;
    }
    const element = ticketsContainer;
    const opt = {
        margin:        [0.4, 0.4, 0.4, 0.4],
        filename:     `tickets-${new Date().getTime()}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, letterRendering: true, useCORS: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
});

// CLEAR tickets
clearBtn.addEventListener('click', () => {
    ticketsContainer.innerHTML = '';
    currentTickets = [];
});

/******************** ANTI-COPY LOCALSTORAGE INTEGRATION ********************/
// verify.html uses this contract; we also pre-initialize usedSet if needed.
// This function is not called here, but we ensure that the generated ticket IDs
// can be verified in verify.html. No auto-mark, just generation.
// (verify.html is separate, uses localStorage key "usedTickets")

// On page load, we can optionally seed example but not needed.
// Ensure discountValue is numeric
discountValueEl.addEventListener('change', function() {
    if (this.value < 0) this.value = 0;
    if (discountTypeEl.value === 'percent' && this.value > 100) this.value = 100;
    computeSummary();
});

// keep summary in sync after generation
generateBtn.addEventListener('click', computeSummary);

console.log('Staff ticket system ready · anti-copy via verify.html');
