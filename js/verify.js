document.addEventListener("DOMContentLoaded", async () => {
  await IA.renderHeader("verify.html");
  await IA.renderFooter();
  await IA.renderNoticeboard();

  const form = document.querySelector("[data-verify-form]");
  const result = document.querySelector("[data-verify-result]");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const certId = form.cert_id.value.trim().toUpperCase();
    const passcode = form.passcode.value.trim().toUpperCase();

    let records = [];
    try {
      records = await IA.loadJSON("data/certificates.json");
    } catch (err) {
      result.innerHTML = `<div class="state-msg">Verification service unavailable right now.</div>`;
      return;
    }

    const match = records.find(r => r.cert_id.toUpperCase() === certId && r.passcode.toUpperCase() === passcode);

    if (!match) {
      result.innerHTML = `
        <div class="program-card" style="border-color:#c0392b">
          <h3 style="color:#c0392b">Not Verified</h3>
          <p>No certificate matches that ID and passcode. Double-check both fields and try again.</p>
        </div>`;
      return;
    }

    result.innerHTML = `
      <div class="program-card" style="border-color:var(--emerald)">
        <div class="program-index">VERIFIED</div>
        <h3>${match.name}</h3>
        <p><strong>Certificate ID:</strong> ${match.cert_id}<br>
        <strong>Program:</strong> ${match.program}<br>
        <strong>Issued:</strong> ${IA.fmtDate(match.issue_date)}</p>
      </div>`;
  });
});
