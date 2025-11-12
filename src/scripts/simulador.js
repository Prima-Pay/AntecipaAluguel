/**
 * @param {number} rate - Taxa de desconto por período.
 * @param {number[]} cashFlow
 * @returns {number} O VPL.
 */
function calculateNPV(rate, cashFlow) {
  let npv = 0;
  for (let i = 0; i < cashFlow.length; i++) {
    npv += cashFlow[i] / Math.pow(1 + rate, i);
  }
  return npv;
}

/**
 * @param {number[]} cashFlow - Fluxo de caixa, ex: [+18750, -5000, -5000, ...].
 * @returns {number}
 */
function calculateIRR(cashFlow) {
  const MAX_ITERATIONS = 100;
  const PRECISION = 1e-7; // 0.0000001
  let minRate = 0.0;
  let maxRate = 1.0;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    let midRate = (minRate + maxRate) / 2;
    let npvAtMid = calculateNPV(midRate, cashFlow);

    if (Math.abs(npvAtMid) < PRECISION) {
      return midRate;
    }

    if (npvAtMid < 0) {
      minRate = midRate;
    } else {
      maxRate = midRate;
    }
  }
  return (minRate + maxRate) / 2;
}

/**
 * Fim das funções de Cálculo Numérico
 * =============================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  // Constantes
  const TAXA_MENSAL_LOCATARIO = 0.05;
  const MAX_MESES_LOCATARIO = 5;
  const TAXA_MENSAL_IMOBILIARIA = 0.05; // Esta é a taxa base da "Prima"
  const MAX_MESES_IMOBILIARIA = 5;
  const CODIGO_PARCEIRO_IMOBILIARIA = "PRIMAPARCEIRO123";
  const COMISSAO_BASE_IMOBILIARIA = 0.1; // 10%

  // Seletores de DOM
  const tipoUsuarioSelect = document.getElementById("tipoUsuario");
  const infoTaxa = document.getElementById("infoTaxa");
  const camposDinamicosWrapper = document.getElementById(
    "camposDinamicosWrapper"
  );
  const validacaoImobiliariaDiv = document.getElementById(
    "validacaoImobiliaria"
  );
  const codigoParceiroInput = document.getElementById("codigoParceiro");
  const btnValidarCodigo = document.getElementById("btnValidarCodigo");
  const avisoCodigoInvalido = document.getElementById("avisoCodigoInvalido");
  const labelValorBase = document.getElementById("labelValorBase");
  const valorBaseMensalInput = document.getElementById("valorBaseMensal");
  const labelValorDesejado = document.getElementById("labelValorDesejado");
  const valorDesejadoInput = document.getElementById("valorDesejado");
  const grupoMarkup = document.getElementById("grupoMarkup");
  const markupInput = document.getElementById("markupInput");
  const avisoLimite = document.getElementById("avisoLimite");
  const simuladorForm = document.getElementById("simuladorForm");
  const btnSimular = document.getElementById("btnSimular");
  const resultadoCalculoDiv = document.getElementById("resultadoCalculo");

  // Evento change (Perfil)
  tipoUsuarioSelect.addEventListener("change", () => {
    const tipo = tipoUsuarioSelect.value;

    avisoLimite.style.display = "none";
    btnSimular.disabled = false;
    resultadoCalculoDiv.style.display = "none";
    camposDinamicosWrapper.style.display = "none";
    validacaoImobiliariaDiv.style.display = "none";
    infoTaxa.style.display = "none";
    avisoCodigoInvalido.style.display = "none";
    grupoMarkup.style.display = "none";

    simuladorForm.reset();
    tipoUsuarioSelect.value = tipo;

    if (tipo === "locatario") {
      labelValorBase.textContent = "Valor mensal do seu aluguel (R$):";
      labelValorDesejado.textContent = "Valor LÍQUIDO que deseja receber (R$):";
      valorBaseMensalInput.placeholder = "Ex: 1000.00";
      valorDesejadoInput.placeholder = "Ex: 950.00";

      infoTaxa.textContent = `Taxa de 5% a 25%, dependendo do valor líquido solicitado`;
      infoTaxa.style.display = "block";

      camposDinamicosWrapper.style.display = "flex";
    } else if (tipo === "imobiliaria") {
      validacaoImobiliariaDiv.style.display = "flex";
      codigoParceiroInput.focus();
    }
  });

  btnValidarCodigo.addEventListener("click", () => {
    const codigoDigitado = codigoParceiroInput.value;

    if (codigoDigitado === CODIGO_PARCEIRO_IMOBILIARIA) {
      avisoCodigoInvalido.style.display = "none";
      validacaoImobiliariaDiv.style.display = "none";

      labelValorBase.textContent =
        "Repasse mensal total para esse Locador (R$):";
      labelValorDesejado.textContent =
        "Valor LÍQUIDO que o Locador deseja receber (R$):";
      valorBaseMensalInput.placeholder = "Ex: 1000.00";
      valorDesejadoInput.placeholder = "Ex: 950.00";
      grupoMarkup.style.display = "block";

      infoTaxa.textContent = `Taxa de 5% a 25%, mais Markup, dependendo do valor líquido solicitado`;
      infoTaxa.style.display = "block";

      camposDinamicosWrapper.style.display = "flex";
      validarLimiteInputs();
    } else {
      avisoCodigoInvalido.style.display = "block";
      codigoParceiroInput.value = "";
      codigoParceiroInput.focus();
    }
  });

  // Função validarLimiteInputs
  function validarLimiteInputs() {
    const tipo = tipoUsuarioSelect.value;
    const base = parseFloat(valorBaseMensalInput.value) || 0;
    const desejadoLiquido = parseFloat(valorDesejadoInput.value) || 0;

    let limiteBruto = 0;
    let limiteLiquido = 0;
    let taxaTotalMaxima = 0;
    let taxaMensalBase = 0;

    if (tipo === "locatario") {
      taxaMensalBase = TAXA_MENSAL_LOCATARIO;
      limiteBruto = base * MAX_MESES_LOCATARIO;
      taxaTotalMaxima = taxaMensalBase * MAX_MESES_LOCATARIO;
    } else if (tipo === "imobiliaria") {
      const markupPerc = parseFloat(markupInput.value) / 100 || 0;
      taxaMensalBase = TAXA_MENSAL_IMOBILIARIA + markupPerc;
      limiteBruto = base * MAX_MESES_IMOBILIARIA;
      taxaTotalMaxima = taxaMensalBase * MAX_MESES_IMOBILIARIA;
    } else {
      avisoLimite.style.display = "none";
      return;
    }

    limiteLiquido = limiteBruto * (1 - taxaTotalMaxima);

    if (base > 0) {
      avisoLimite.textContent = `Limite líquido para este locador: R$ ${limiteLiquido.toLocaleString(
        "pt-BR",
        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      )}`;
      avisoLimite.style.display = "block";
      avisoLimite.style.color = "#4CAF50";
    } else {
      avisoLimite.style.display = "none";
    }

    if (desejadoLiquido > limiteLiquido && limiteLiquido > 0) {
      avisoLimite.textContent = `O valor inserido excede o limite líquido de R$ ${limiteLiquido.toLocaleString(
        "pt-BR",
        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      )}`;
      avisoLimite.style.color = "#c0392b";
      btnSimular.disabled = true;
    } else {
      btnSimular.disabled = false;
      if (base > 0) {
        avisoLimite.textContent = `Limite líquido para este locador: R$ ${limiteLiquido.toLocaleString(
          "pt-BR",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )}`;
        avisoLimite.style.color = "#4CAF50";
      }
    }
  }

  valorBaseMensalInput.addEventListener("input", validarLimiteInputs);
  valorDesejadoInput.addEventListener("input", validarLimiteInputs);
  markupInput.addEventListener("input", validarLimiteInputs);

  simuladorForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const tipo = tipoUsuarioSelect.value;
    const valorBase = parseFloat(valorBaseMensalInput.value);
    const valorLiquidoSolicitado = parseFloat(valorDesejadoInput.value);

    let taxaMensalBase = 0;
    let maxMeses = 0;
    let markupPerc = 0;

    if (
      isNaN(valorBase) ||
      valorBase <= 0 ||
      isNaN(valorLiquidoSolicitado) ||
      valorLiquidoSolicitado <= 0
    ) {
      alert("Por favor, preencha todos os valores corretamente.");
      return;
    }

    if (tipo === "locatario") {
      taxaMensalBase = TAXA_MENSAL_LOCATARIO;
      maxMeses = MAX_MESES_LOCATARIO;
    } else if (tipo === "imobiliaria") {
      markupPerc = parseFloat(markupInput.value) / 100 || 0; // << NOVO: Captura o markup
      taxaMensalBase = TAXA_MENSAL_IMOBILIARIA + markupPerc;
      maxMeses = MAX_MESES_IMOBILIARIA;
    }

    // Lógica de Faixas
    let taxaTotalAplicada = 0;

    const taxaFaixa1 = taxaMensalBase * 1;
    const taxaFaixa2 = taxaMensalBase * 2;
    const taxaFaixa3 = taxaMensalBase * 3;
    const taxaFaixa4 = taxaMensalBase * 4;
    const taxaFaixa5 = taxaMensalBase * 5;

    const tetoLiquidoFaixa1 = valorBase * 1 * (1 - taxaFaixa1);
    const tetoLiquidoFaixa2 = valorBase * 2 * (1 - taxaFaixa2);
    const tetoLiquidoFaixa3 = valorBase * 3 * (1 - taxaFaixa3);
    const tetoLiquidoFaixa4 = valorBase * 4 * (1 - taxaFaixa4);

    if (valorLiquidoSolicitado <= tetoLiquidoFaixa1) {
      taxaTotalAplicada = taxaFaixa1;
    } else if (valorLiquidoSolicitado <= tetoLiquidoFaixa2) {
      taxaTotalAplicada = taxaFaixa2;
    } else if (valorLiquidoSolicitado <= tetoLiquidoFaixa3) {
      taxaTotalAplicada = taxaFaixa3;
    } else if (valorLiquidoSolicitado <= tetoLiquidoFaixa4) {
      taxaTotalAplicada = taxaFaixa4;
    } else {
      taxaTotalAplicada = taxaFaixa5;
    }

    // Cálculo do Bruto e Custo Total
    let valorBrutoTotal = valorLiquidoSolicitado / (1 - taxaTotalAplicada);
    let custoTotal = valorBrutoTotal - valorLiquidoSolicitado;

    let limiteBruto = valorBase * maxMeses;
    if (valorBrutoTotal > limiteBruto + 0.01) {
      alert(
        "O valor solicitado, somado às taxas, excede o limite total. Por favor, solicite um valor líquido menor."
      );
      return;
    }

    let lucroTotalImobiliaria = 0;
    if (tipo === "imobiliaria") {
      // 1. Lucro do Markup (100% do markup's share do custo total)
      // (Ex: Custo=1000, TaxaBase=6% (5+1). Markup é 1/6 do custo)
      const lucroMarkup =
        taxaMensalBase > 0 ? custoTotal * (markupPerc / taxaMensalBase) : 0;

      // 2. Lucro de Comissão (10% do share da taxa base)
      // (Ex: Custo=1000, TaxaBase=6% (5+1). Base é 5/6 do custo. Comissão é 10% disso)
      const lucroBase =
        taxaMensalBase > 0
          ? custoTotal *
            (TAXA_MENSAL_IMOBILIARIA / taxaMensalBase) *
            COMISSAO_BASE_IMOBILIARIA
          : 0;

      // 3. Lucro Total
      lucroTotalImobiliaria = lucroBase + lucroMarkup;
    }

    // Montagem do Fluxo de Caixa
    const cashFlow = [valorLiquidoSolicitado];
    let brutoRestante = valorBrutoTotal;

    while (brutoRestante > 0.001) {
      if (brutoRestante >= valorBase) {
        cashFlow.push(-valorBase);
        brutoRestante -= valorBase;
      } else {
        cashFlow.push(-brutoRestante);
        brutoRestante = 0;
      }
    }

    // Cálculo do CET
    const cetMensal = calculateIRR(cashFlow);
    const cetAnual = Math.pow(1 + cetMensal, 12) - 1;

    // Coleta de dados para exibição
    const numParcelas = cashFlow.length - 1;
    const ultimoPagamentoAbs = Math.abs(cashFlow[cashFlow.length - 1]);

    // Chamar a função de exibição com os novos parâmetros
    exibirResultado(
      valorLiquidoSolicitado,
      custoTotal,
      valorBrutoTotal,
      valorBase,
      numParcelas,
      cetMensal,
      ultimoPagamentoAbs,
      taxaTotalAplicada,
      taxaMensalBase,
      lucroTotalImobiliaria,
      tipo
    );
  });

  function exibirResultado(
    liquido,
    custo,
    bruto,
    valorBase,
    numParcelas,
    cetMensal,
    ultimoPagamentoAbs,
    taxaTotal,
    taxaMensal,
    lucroTotalImobiliaria,
    tipo
  ) {
    const formatoMoeda = { style: "currency", currency: "BRL" };
    const formatoPercent = {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };

    // Cálculo do Custo Mensal em R$
    const numMesesEquivalentes = taxaTotal > 0 ? taxaTotal / taxaMensal : 0;
    const custoMensal =
      numMesesEquivalentes > 0 ? custo / numMesesEquivalentes : 0;
    const custoMensalFormatado = custoMensal.toLocaleString(
      "pt-BR",
      formatoMoeda
    );

    const cetMensalFormatado = cetMensal.toLocaleString("pt-BR", formatoPercent);
    const valorBaseFormatado = valorBase.toLocaleString("pt-BR", formatoMoeda);
    const ultimoPagamentoFormatado = ultimoPagamentoAbs.toLocaleString(
      "pt-BR",
      formatoMoeda
    );

    let textoComprometimento = "";
    const isUltimaParcelaCheia = Math.abs(ultimoPagamentoAbs - valorBase) < 0.01;

    if (numParcelas === 1) {
      textoComprometimento = `(Compromete 1 recebimento de ${ultimoPagamentoFormatado})`;
    } else if (isUltimaParcelaCheia) {
      textoComprometimento = `(Compromete ${numParcelas} recebimentos de ${valorBaseFormatado})`;
    } else {
      const numParcelasCheias = numParcelas - 1;
      textoComprometimento = `(Compromete ${numParcelasCheias} recebimentos de ${valorBaseFormatado} e 1 recebimento parcial de ${ultimoPagamentoFormatado})`;
    }


    let lucroHtml = "";
    if (tipo === "imobiliaria" && lucroTotalImobiliaria > 0) {
      const lucroFormatado = lucroTotalImobiliaria.toLocaleString(
        "pt-BR",
        formatoMoeda
      );

      lucroHtml = `
          <div class="quadro-item-economia">
            <h3>Seu Lucro na Operação:</h3>
            <span id="lucro-imobiliaria">${lucroFormatado}</span>
            <p style="font-size: 0.8em; opacity: 0.9; margin-top: 10px;">(Comissão de 10% + Valor do Markup)</p>
          </div>
        `;
    }
  
    resultadoCalculoDiv.innerHTML = `
      <h2>Resultado da Simulação:</h2>
      <div class="resultado-colunas">
        <div class="coluna-resultados">
          
          <div class="quadro-item mensal">
            <h3>Valor Líquido a Receber</h3>
            <p class="valor-economia"><span id="resultadoValorLiquido">${liquido.toLocaleString(
              "pt-BR",
              formatoMoeda
            )}</span></p>
          </div>
          
          <div class="quadro-item total">
            <h3>Custo Mensal da Operação</h3>
            <p class="valor-economia-total">
              <span id="resultadoCustoTotal">${custoMensalFormatado}</span>
            </p>
            <small id="resultadoInfoTaxa" class="cet-explicacao">
              (CET de ${cetMensalFormatado} a.m.)
            </small>
          </div>

          <div class="quadro-item">
            <h3>Valor total Comprometido:</h3>
            <p class="valor-economia" style="color: var(--cor-solida-principal);">
              <span id="resultadoValorBruto">${bruto.toLocaleString(
                "pt-BR",
                formatoMoeda
              )}</span>
            </p>
            <small class="resumo-comprometimento">
              ${textoComprometimento}
            </small>
          </div>

          ${lucroHtml}

        </div>
      </div>
      <button id="btnContratar" class="btn-secundario">
        Quero Contratar
      </button>
    `;

    resultadoCalculoDiv
      .querySelector("#btnContratar")
      .addEventListener("click", () => {
        window.location.href = "https://wa.me/message/4BXMIP4XJNK4M1";
      });

    resultadoCalculoDiv.style.display = "block";
    resultadoCalculoDiv.scrollIntoView({ behavior: "smooth", block: "start" });
  }
 
});