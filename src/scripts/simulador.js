document.addEventListener("DOMContentLoaded", () => {
  // --- REGRAS DE NEGÓCIO ---
  const TAXA_MENSAL_LOCATARIO = 0.05; // 5% ao mês
  const MAX_MESES_LOCATARIO = 5; 
  const TAXA_TOTAL_LOCATARIO = TAXA_MENSAL_LOCATARIO * MAX_MESES_LOCATARIO; 

  const TAXA_MENSAL_IMOBILIARIA = 0.05; // 5% ao mês (Taxa BASE da Prima)
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
    
    // Reseta tudo
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
      
      infoTaxa.textContent = `Taxa de juros de 5% a 25%, dependendo do valor solicitado.`;
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

        labelValorBase.textContent = "Repasse mensal total para esse locatário (R$):";
        labelValorDesejado.textContent = "Valor LÍQUIDO que o locatário deseja receber (R$):";
        valorBaseMensalInput.placeholder = "Ex: 1000.00";
        valorDesejadoInput.placeholder = "Ex: 950.00";
        grupoMarkup.style.display = "block";
        
        infoTaxa.textContent = `Taxa base de 5% a.m. (Custo total de 5% a 25% + Markup, dependendo do valor).`;
        infoTaxa.style.display = "block";
        
        camposDinamicosWrapper.style.display = "flex"; 
        validarLimiteInputs(); 

    } else {
        avisoCodigoInvalido.style.display = "block";
        codigoParceiroInput.value = ""; 
        codigoParceiroInput.focus();
    }
  });


  /**
   * 3. Validação de limite
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

  /**
   * 4. Manipulador de envio do formulário (LÓGICA DE FAIXAS)
   */
  simuladorForm.addEventListener("submit", (event) => {
    event.preventDefault(); 

    const tipo = tipoUsuarioSelect.value;
    const valorBase = parseFloat(valorBaseMensalInput.value);
    const valorLiquidoSolicitado = parseFloat(valorDesejadoInput.value);

    let taxaMensalBase = 0;
    let maxMeses = 0;

    if (isNaN(valorBase) || valorBase <= 0 || isNaN(valorLiquidoSolicitado) || valorLiquidoSolicitado <= 0) {
      alert("Por favor, preencha todos os valores corretamente.");
      return;
    }
    
    if (tipo === "locatario") {
      taxaMensalBase = TAXA_MENSAL_LOCATARIO;
      maxMeses = MAX_MESES_LOCATARIO;
    } else if (tipo === "imobiliaria") {
      const markupPerc = parseFloat(markupInput.value) / 100 || 0; 
      taxaMensalBase = TAXA_MENSAL_IMOBILIARIA + markupPerc; 
      maxMeses = MAX_MESES_IMOBILIARIA;
    }

    let taxaTotalAplicada = 0;
    
    const taxaFaixa1 = taxaMensalBase * 1; 
    const taxaFaixa2 = taxaMensalBase * 2; 
    const taxaFaixa3 = taxaMensalBase * 3; 
    const taxaFaixa4 = taxaMensalBase * 4; 
    const taxaFaixa5 = taxaMensalBase * 5; 

    const tetoLiquidoFaixa1 = (valorBase * 1) * (1 - taxaFaixa1); 
    const tetoLiquidoFaixa2 = (valorBase * 2) * (1 - taxaFaixa2); 
    const tetoLiquidoFaixa3 = (valorBase * 3) * (1 - taxaFaixa3); 
    const tetoLiquidoFaixa4 = (valorBase * 4) * (1 - taxaFaixa4); 
    // const tetoLiquidoFaixa5 = (valorBase * 5) * (1 - taxaFaixa5); // Não é necessário

    if (valorLiquidoSolicitado <= tetoLiquidoFaixa1) {
      taxaTotalAplicada = taxaFaixa1; // 5%
    } else if (valorLiquidoSolicitado <= tetoLiquidoFaixa2) {
      taxaTotalAplicada = taxaFaixa2; // 10%
    } else if (valorLiquidoSolicitado <= tetoLiquidoFaixa3) {
      taxaTotalAplicada = taxaFaixa3; // 15%
    } else if (valorLiquidoSolicitado <= tetoLiquidoFaixa4) {
      taxaTotalAplicada = taxaFaixa4; // 20%
    } else {
      taxaTotalAplicada = taxaFaixa5; // 25%
    }

    let valorBrutoTotal = valorLiquidoSolicitado / (1 - taxaTotalAplicada);
    let custoTotal = valorBrutoTotal - valorLiquidoSolicitado;
    
    let limiteBruto = valorBase * maxMeses;
    if (valorBrutoTotal > (limiteBruto + 0.01)) {
         alert("O valor solicitado, somado às taxas, excede o limite total. Por favor, solicite um valor líquido menor.");
         return;
    }

    exibirResultado(valorLiquidoSolicitado, custoTotal, valorBrutoTotal, taxaTotalAplicada, taxaMensalBase);
  });

  /**
   * 5. Função auxiliar para formatar e exibir os resultados
   */
  function exibirResultado(liquido, custo, bruto, taxaTotal, taxaMensal) { 
    const formatoMoeda = { style: "currency", currency: "BRL" };

    const taxaTotalFormatada = (taxaTotal * 100).toFixed(0);
    const taxaMensalFormatada = (taxaMensal * 100).toFixed(1);
    const mesesEquivalentes = (taxaTotal / taxaMensal).toFixed(0);

    // --- MUDANÇA 5: Removemos o "R$" hard-coded de dentro dos <p> ---
    resultadoCalculoDiv.innerHTML = `
        <h2>Resultado da Simulação:</h2>
        <div class="resultado-colunas">
          <div class="coluna-resultados">
            <div class="quadro-item mensal">
              <h3>Valor Líquido a Receber</h3>
              <p class="valor-economia"><span id="resultadoValorLiquido">${liquido.toLocaleString("pt-BR", formatoMoeda)}</span></p>
            </div>
            
            <div class="quadro-item total">
              <h3>Custos da Operação (Juros/Taxas)</h3>
              <p class="valor-economia-total"><span id="resultadoCustoTotal">${custo.toLocaleString("pt-BR", formatoMoeda)}</span></p>
              
              <small id="resultadoInfoTaxa" style="font-weight: 600;">
                (Custo total: ${taxaTotalFormatada}% sobre o valor bruto.)
              </small>
            </div>

            <div class="quadro-item">
              <h3>Valor Total Comprometido (Bruto)</h3>
              <p class="valor-economia" style="color: var(--cor-solida-principal);">
                <span id="resultadoValorBruto">${bruto.toLocaleString("pt-BR", formatoMoeda)}</span>
              </p>
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