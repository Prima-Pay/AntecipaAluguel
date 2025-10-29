document.addEventListener("DOMContentLoaded", () => {
  // --- REGRAS DE NEGÓCIO ---
  const TAXA_MENSAL_LOCATARIO = 0.05; 
  const MAX_MESES_LOCATARIO = 5; 
  const TAXA_TOTAL_LOCATARIO = TAXA_MENSAL_LOCATARIO * MAX_MESES_LOCATARIO;

  const TAXA_MENSAL_IMOBILIARIA = 0.05;
  const MAX_MESES_IMOBILIARIA = 5; 
  const TAXA_TOTAL_IMOBILIARIA = TAXA_MENSAL_IMOBILIARIA * MAX_MESES_IMOBILIARIA;

  const CODIGO_PARCEIRO_IMOBILIARIA = "PRIMAPARCEIRO123"; 

  // --- Seletores do DOM ---
  const tipoUsuarioSelect = document.getElementById("tipoUsuario");
  const infoTaxa = document.getElementById("infoTaxa"); 
  const camposDinamicosWrapper = document.getElementById("camposDinamicosWrapper");
  
  const validacaoImobiliariaDiv = document.getElementById("validacaoImobiliaria");
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
 
  // --- LÓGICA PRINCIPAL ---

  tipoUsuarioSelect.addEventListener("change", () => {
    const tipo = tipoUsuarioSelect.value;
    
    // Reseta tudo ao trocar
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
      // Configuração dos campos para locatário.
      labelValorBase.textContent = "Valor mensal do seu aluguel (R$):";
      labelValorDesejado.textContent = "Valor LÍQUIDO que deseja receber (R$):";
      valorBaseMensalInput.placeholder = "Ex: 1000.00";
      valorDesejadoInput.placeholder = "Ex: 950.00";
      
      //infoTaxa.textContent = `Custo total do serviço: ${TAXA_TOTAL_LOCATARIO * 100}%`;
      //infoTaxa.style.display = "block";
      
      camposDinamicosWrapper.style.display = "flex";

    } else if (tipo === "imobiliaria") {
      validacaoImobiliariaDiv.style.display = "flex"; 
      codigoParceiroInput.focus(); 
    } else {
      infoTaxa.style.display = "none"; 
      camposDinamicosWrapper.style.display = "none";
      validacaoImobiliariaDiv.style.display = "none";
    }
  });

  btnValidarCodigo.addEventListener("click", () => {
    const codigoDigitado = codigoParceiroInput.value;

    if (codigoDigitado === CODIGO_PARCEIRO_IMOBILIARIA) {
        // --- SUCESSO ---
        avisoCodigoInvalido.style.display = "none";
        validacaoImobiliariaDiv.style.display = "none"; 

        labelValorBase.textContent = "Repasse mensal total para esse locatário (R$):";
        labelValorDesejado.textContent = "Valor LÍQUIDO que o locatário deseja receber (R$):";
        valorBaseMensalInput.placeholder = "Ex: 1000.00";
        valorDesejadoInput.placeholder = "Ex: 950.00";
        grupoMarkup.style.display = "block";
        
        infoTaxa.textContent = `Taxa base: ${(TAXA_MENSAL_IMOBILIARIA * 100).toFixed(0)}% a.m. (será somada ao markup).`;
        infoTaxa.style.display = "block";
        
        camposDinamicosWrapper.style.display = "flex"; 
        validarLimiteInputs(); 

    } else {
        // --- FALHA ---
        avisoCodigoInvalido.style.display = "block";
        codigoParceiroInput.value = ""; 
        codigoParceiroInput.focus();
    }
  });


  /**
   * 3. Validação de limite (Calcula o limite líquido MÁXIMO)
   * (Usando taxa total fixa, de 25%)
   */
  function validarLimiteInputs() {
    const tipo = tipoUsuarioSelect.value; 
    const base = parseFloat(valorBaseMensalInput.value) || 0;
    const desejadoLiquido = parseFloat(valorDesejadoInput.value) || 0;

    let limiteBruto = 0;
    let limiteLiquido = 0;
    let taxaTotalMaxima = 0; 
    let taxaMensalBase = 0;

    if (tipo === "locatario") {
      limiteBruto = base * MAX_MESES_LOCATARIO;
      taxaMensalBase = TAXA_MENSAL_LOCATARIO;
      taxaTotalMaxima = taxaMensalBase * MAX_MESES_LOCATARIO; // 25%

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
    // (Ex: 5000 * (1 - 0.25) = 3750. CORRETO)

    if (base > 0) {
      avisoLimite.textContent = `Limite líquido para este locatário: R$ ${limiteLiquido.toLocaleString("pt-BR", {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
      avisoLimite.style.display = "block";
      avisoLimite.style.color = "#4CAF50"; 
    } else {
       avisoLimite.style.display = "none";
    }

    if (desejadoLiquido > limiteLiquido && limiteLiquido > 0) {
      avisoLimite.textContent = `O valor inserido excede o limite líquido de R$ ${limiteLiquido.toLocaleString("pt-BR", {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
      avisoLimite.style.color = "#c0392b"; 
      btnSimular.disabled = true;
    } else {
      btnSimular.disabled = false;
      if (base > 0) {
        avisoLimite.textContent = `Limite líquido para este locatário: R$ ${limiteLiquido.toLocaleString("pt-BR", {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
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

    let taxaMensal = 0;
    let limiteBruto = 0;
    let maxMeses = 0;
    let taxaTotal = 0; // Taxa total (fixa) da operação

    if (isNaN(valorBase) || valorBase <= 0 || isNaN(valorLiquidoSolicitado) || valorLiquidoSolicitado <= 0) {
      alert("Por favor, preencha todos os valores corretamente.");
      return;
    }
    
    if (tipo === "locatario") {
      taxaMensal = TAXA_MENSAL_LOCATARIO;
      maxMeses = MAX_MESES_LOCATARIO;
      taxaTotal = taxaMensal * maxMeses; // 0.05 * 5 = 0.25 (25%)

    } else if (tipo === "imobiliaria") {
      const markupPerc = parseFloat(markupInput.value) / 100 || 0; 
      taxaMensal = TAXA_MENSAL_IMOBILIARIA + markupPerc; 
      maxMeses = MAX_MESES_IMOBILIARIA;
      taxaTotal = taxaMensal * maxMeses; // (0.05 + markup) * 5
    }

    let valorBrutoTotal = valorLiquidoSolicitado / (1 - taxaTotal);
    let custoTotal = valorBrutoTotal - valorLiquidoSolicitado;
    
    // (Ex: 3750 / (1 - 0.25) = 3750 / 0.75 = 5000. CORRETO)
    // (Custo: 5000 - 3750 = 1250. CORRETO)
    
    limiteBruto = valorBase * maxMeses;
    if (valorBrutoTotal > (limiteBruto + 0.01)) {
         alert("O valor solicitado, somado às taxas, excede o limite total. Por favor, solicite um valor líquido menor.");
         return;
    }

    exibirResultado(valorLiquidoSolicitado, custoTotal, valorBrutoTotal, taxaTotal, taxaMensal);
  });

  function exibirResultado(liquido, custo, bruto, taxaTotal, taxaMensal) { 
    const formatoMoeda = { style: "currency", currency: "BRL" };

    const taxaTotalFormatada = (taxaTotal * 100).toFixed(0); // 25%
    const taxaMensalFormatada = (taxaMensal * 100).toFixed(1); // 5.0% (ou 5.0 + markup)

    resultadoCalculoDiv.innerHTML = `
        <h2>Resultado da Simulação:</h2>
        <div class="resultado-colunas">
          <div class="coluna-resultados">
            <div class="quadro-item mensal">
              <h3>Valor Líquido a Receber</h3>
              <p class="valor-economia">R$ <span id="resultadoValorLiquido">${liquido.toLocaleString("pt-BR", formatoMoeda)}</span></p>
            </div>
            
            <div class="quadro-item total">
              <h3>Custos da Operação (Juros/Taxas)</h3>
              <p class="valor-economia-total">R$ <span id="resultadoCustoTotal">${custo.toLocaleString("pt-BR", formatoMoeda)}</span></p>
              
              <small id="resultadoInfoTaxa" style="font-weight: 600;">(Custo total: ${taxaTotalFormatada}% sobre o valor bruto)</small>
            </div>

            <div class="quadro-item">
              <h3>Valor Total Comprometido (Bruto)</h3>
              <p class="valor-economia" style="color: var(--cor-solida-principal);">
                R$ <span id="resultadoValorBruto">${bruto.toLocaleString("pt-BR", formatoMoeda)}</span>
              </Custo>
            </div>
          </div>
        </div>
        <button id="btnContratar" class="btn-secundario">
          Quero Contratar
        </button>
    `;
    
    resultadoCalculoDiv.querySelector("#btnContratar").addEventListener("click", () => {
        window.location.href = "https://wa.me/message/4BXMIP4XJNK4M1";
    });

    resultadoCalculoDiv.style.display = "block";
    resultadoCalculoDiv.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});