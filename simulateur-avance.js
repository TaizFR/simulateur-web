// simulateur-avance.js

function vc_oneyear(pu, pp, rx) {
  const rx_mens = Math.pow(1 + rx, 1 / 12) - 1;
  return pu * Math.pow(1 + rx_mens, 12) + pp * ((Math.pow(1 + rx_mens, 12) - 1) / rx_mens);
}

function rev_compl(k_int, part_optelios, an, frais_gestion, marie_pacse) {
  let rev_annuel = k_int - part_optelios - frais_gestion;
  let impot_pv = 0;
  if (an >= 8) {
    const seuil = marie_pacse ? 9200 : 4600;
    if (rev_annuel > seuil) {
      impot_pv = (rev_annuel - seuil) * 0.247;
    }
  } else {
    impot_pv = rev_annuel * 0.3;
  }
  rev_annuel -= impot_pv;
  return {
    rev_annuel,
    rev_mensuel: rev_annuel / 12,
    impot_pv
  };
}

function simulation(pu, pp, rx, an, marie_pacse) {
  rx /= 100;
  let total_part_optelios = 0;
  let total_frais_gestion = 0;
  let frais_total = pu * 0.01;
  let k_initial = pu * 0.99;
  let int_gen = 0;
  let k_final = 0;

  for (let i = 0; i < an; i++) {
    const v_totaux = k_initial + (pp * 12);
    const k_terme = vc_oneyear(k_initial, pp, rx);
    int_gen = k_terme - v_totaux;
    const perf_reelle = (k_terme / v_totaux) - 1;
    const part_optelios = perf_reelle > 0 ? ((perf_reelle - 0.05) / perf_reelle) * 0.1 * int_gen : 0;
    const frais_gestion = k_terme * 0.01;

    total_part_optelios += part_optelios;
    total_frais_gestion += frais_gestion;

    k_final = k_terme - part_optelios - frais_gestion;
    k_initial = k_final;
  }

  const { rev_annuel, rev_mensuel, impot_pv } = rev_compl(int_gen, total_part_optelios, an, total_frais_gestion, marie_pacse);

  return {
    capital_final: k_final,
    frais_optelios: total_part_optelios,
    frais_gestion: total_frais_gestion,
    revenu_annuel: rev_annuel,
    revenu_mensuel: rev_mensuel,
    impot: impot_pv,
    annee: an
  };
}

function lancerSimuAvance() {
  const pu = parseFloat(document.getElementById("pu").value || "0");
  const pp = parseFloat(document.getElementById("pp").value || "0");
  const rx = parseFloat(document.getElementById("rx").value || "0");
  const an = parseInt(document.getElementById("an").value || "1");
  const marie = document.getElementById("marie").checked;

  const res = simulation(pu, pp, rx, an, marie);

  const container = document.getElementById("simu-avance");
  container.innerHTML = `
    <div style="background:#083346;padding:20px;border-radius:10px;color:white;">
      <h3>Résultats sur ${res.annee} an${res.annee > 1 ? 's' : ''}</h3>
      <p><strong>Capital final :</strong> ${Math.round(res.capital_final).toLocaleString('fr-FR')} €</p>
      <p><strong>Frais Optélios :</strong> ${Math.round(res.frais_optelios).toLocaleString('fr-FR')} €</p>
      <p><strong>Frais de gestion :</strong> ${Math.round(res.frais_gestion).toLocaleString('fr-FR')} €</p>
      <p><strong>Impôt annuel :</strong> ${Math.round(res.impot).toLocaleString('fr-FR')} €</p>
      <p><strong>Revenu annuel net :</strong> ${Math.round(res.revenu_annuel).toLocaleString('fr-FR')} €</p>
      <p><strong>Revenu mensuel net :</strong> ${Math.round(res.revenu_mensuel).toLocaleString('fr-FR')} €</p>
    </div>
  `;
}
