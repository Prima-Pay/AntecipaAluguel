document.addEventListener("DOMContentLoaded", () => {
    // Variável de estado para controlar se as opções de desconto já foram exibidas.
    let selectOptionsShown = false;

    // Objeto que contém todas as regras de negócio
    const REGRAS_DE_COTACAO_POR_FAIXA = [
        { min: 120, max: 219.99, opcoes: [{ desconto: 0.15, fidelidade: 12 }, { desconto: 0.16, fidelidade: 36 }] },
        { min: 220, max: 499.99, opcoes: [{ desconto: 0.15, fidelidade: 12 }, { desconto: 0.16, fidelidade: 18 }, { desconto: 0.17, fidelidade: 24 }, { desconto: 0.18, fidelidade: 36 }] },
        { min: 500, max: 999.99, opcoes: [{ desconto: 0.15, fidelidade: 12 }, { desconto: 0.17, fidelidade: 18 }, { desconto: 0.19, fidelidade: 24 }, { desconto: 0.20, fidelidade: 36 }] },
        { min: 1000, max: 1999.99, opcoes: [{ desconto: 0.15, fidelidade: 12 }, { desconto: 0.18, fidelidade: 18 }, { desconto: 0.20, fidelidade: 24 }, { desconto: 0.22, fidelidade: 36 }] },
        { min: 2000, max: 4999.99, opcoes: [{ desconto: 0.15, fidelidade: 12 }, { desconto: 0.18, fidelidade: 18 }, { desconto: 0.21, fidelidade: 24 }, { desconto: 0.24, fidelidade: 36 }] },
        { min: 5000, max: 9999.99, opcoes: [{ desconto: 0.15, fidelidade: 12 }, { desconto: 0.19, fidelidade: 18 }, { desconto: 0.23, fidelidade: 24 }, { desconto: 0.26, fidelidade: 36 }] },
        { min: 10000, max: Infinity, opcoes: [{ desconto: 0.15, fidelidade: 12 }, { desconto: 0.20, fidelidade: 18 }, { desconto: 0.25, fidelidade: 24 }, { desconto: 0.30, fidelidade: 36 }] }
    ];
    
    const VALOR_MINIMO = REGRAS_DE_COTACAO_POR_FAIXA[0].min;

    // --- Seletores do DOM ---
    const valorLuzInput = document.getElementById("valorLuz");
    const cotacaoForm = document.getElementById("cotacaoForm"); 
    const opcoesDescontoDiv = document.getElementById("opcoesDescontoContainer");
    const selectDesconto = document.getElementById("selectDesconto"); 
    const resultadoCalculoDiv = document.getElementById("resultadoCalculo");
    const valorEconomiaMensalSpan = document.getElementById("valorEconomiaMensal"); 
    const valorEconomiaTotalSpan = document.getElementById("valorEconomiaTotal"); 
    const propagandaDescontoSpan = document.getElementById("propagandaDesconto");
    const propagandaEconomiaTotalSpan = document.getElementById("propagandaEconomiaTotal");
    const btnContato = document.getElementById("btnContato");
    const btnCalcular = document.getElementById("btnCalcular");
    const textoAnimadoElement = document.getElementById("texto-animado");

    const textosAnimacao = [ 
        "É simples, rápido e sem compromisso.",
        "Descubra sua economia.",
        "Transforme sua conta de luz hoje.",
        "Junte-se a milhares de clientes satisfeitos.",
        "Economize com energia solar.",
        "Soluções personalizadas para você.",
    ];
    let indexTexto = 0;
    let indexChar = 0;
    let isDeleting = false;
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const delayBetweenTexts = 1500;

    function typeWriter() {
        const currentText = textosAnimacao[indexTexto];
        if (isDeleting) {
            textoAnimadoElement.textContent = currentText.substring(0, indexChar - 1);
            indexChar--;
        } else {
            textoAnimadoElement.textContent = currentText.substring(0, indexChar + 1);
            indexChar++;
        }

        let speed = isDeleting ? deletingSpeed : typingSpeed;

        if (!isDeleting && indexChar === currentText.length) {
            speed = delayBetweenTexts;
            isDeleting = true;
        } else if (isDeleting && indexChar === 0) {
            isDeleting = false;
            indexTexto = (indexTexto + 1) % textosAnimacao.length;
            speed = typingSpeed;
        }

        setTimeout(typeWriter, speed);
    }
    
    // INICIA A ANIMAÇÃO ASSIM QUE O DOM CARREGA
    typeWriter();

    // --- Funções Auxiliares (mantidas) ---
    function encontrarDesconto36Meses(valor) {
        const regra = REGRAS_DE_COTACAO_POR_FAIXA.find(r => valor >= r.min && valor <= r.max);
        if (!regra) return null;
        const opcao36Meses = regra.opcoes.find(o => o.fidelidade === 36);
        return opcao36Meses || null;
    }

    /**
     * 1. POPULA as opções de desconto e ATUALIZA a variável de estado.
     */
    function popularOpcoesDeDesconto(valor) {
        const regra = REGRAS_DE_COTACAO_POR_FAIXA.find(r => valor >= r.min && valor <= r.max);
        
        selectDesconto.innerHTML = '<option value="" data-fidelidade="0">-- Escolha uma opção de desconto --</option>'; 
        
        if (regra) {
            regra.opcoes.forEach(opcao => {
                const descontoPercentual = (opcao.desconto * 100).toFixed(0);
                const valorOpcao = `${descontoPercentual}|${opcao.fidelidade}`;
                
                const option = document.createElement('option');
                option.value = valorOpcao;
                option.textContent = `${descontoPercentual}% de Desconto (Fidelidade: ${opcao.fidelidade} meses)`;
                
                selectDesconto.appendChild(option);
            });
            
            opcoesDescontoDiv.style.display = 'block';
            selectDesconto.disabled = false;
            selectOptionsShown = true; // <--- FLAG DEFINIDA AQUI
            
            // Listener crucial: Após escolher uma opção, MANDA O FOCO PARA O BOTÃO CALCULAR
            selectDesconto.onchange = () => {
                resultadoCalculoDiv.style.display = 'none'; 
                
                setTimeout(() => {
                    btnCalcular.focus();
                }, 50); 
            };

        } else {
            opcoesDescontoDiv.style.display = 'none';
            selectDesconto.disabled = true;
            selectOptionsShown = false; // FLAG RESETADA
        }
    }


    /**
     * 2. Calcula a economia.
     */
    function calcularEconomia() {
        const valorContaLuz = parseFloat(valorLuzInput.value);

        if (isNaN(valorContaLuz) || valorContaLuz <= 0 || valorContaLuz < VALOR_MINIMO) {
            alert(`Por favor, insira um valor válido (mínimo R$${VALOR_MINIMO}) para a sua conta de luz.`);
            return;
        }
        
        const valorSelecionado = selectDesconto.value; 
        
        if (valorSelecionado === "") { 
            // ALERTA DE SELEÇÃO: Se cair aqui, é o segundo Enter sem seleção.
            alert("Você deve escolher um percentual de desconto na caixa de seleção para calcular a economia.");
            return;
        }
        
        // --- CÁLCULO PRINCIPAL E PROPAGANDA (Mantido) ---
        const [descontoPercentualStr, fidelidadeMesesStr] = valorSelecionado.split('|');
        const percentualEconomia = parseFloat(descontoPercentualStr) / 100;
        const fidelidadeMeses = parseInt(fidelidadeMesesStr);

        const economiaEstimadaMensal = valorContaLuz * percentualEconomia; 
        const economiaTotalEstimada = economiaEstimadaMensal * fidelidadeMeses; 

        // Atualizações (Principal)
        const valorMensalFormatado = economiaEstimadaMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const valorTotalFormatado = economiaTotalEstimada.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        valorEconomiaMensalSpan.textContent = valorMensalFormatado;
        valorEconomiaTotalSpan.textContent = valorTotalFormatado;
        
        // CÁLCULO DE PROPAGANDA
        const oferta36Meses = encontrarDesconto36Meses(valorContaLuz);
        if (oferta36Meses) {
            const maxDesconto = oferta36Meses.desconto;
            const maxDescontoPercentual = (maxDesconto * 100).toFixed(0); 
            const economiaPropagandaMensal = valorContaLuz * maxDesconto;
            const economiaPropagandaTotal = economiaPropagandaMensal * 36; 

            const valorPropagandaTotalFormatado = economiaPropagandaTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            
            propagandaDescontoSpan.textContent = `${maxDescontoPercentual}%`;
            propagandaEconomiaTotalSpan.textContent = `R$ ${valorPropagandaTotalFormatado}`;
        } else {
            propagandaDescontoSpan.textContent = `N/A`;
            propagandaEconomiaTotalSpan.textContent = `N/A`;
        }
        
        // EXIBIÇÃO FINAL
        resultadoCalculoDiv.style.display = "block"; 
        resultadoCalculoDiv.scrollIntoView({ behavior: "smooth" });
    }

    // --- EVENT LISTENERS FINAIS ---
    
    // 1. NOVO: Reseta o estado e a visualização assim que o usuário digita algo novo no input.
    valorLuzInput.addEventListener("input", () => {
        if (selectOptionsShown) {
            selectOptionsShown = false;
            opcoesDescontoDiv.style.display = 'none';
            resultadoCalculoDiv.style.display = 'none';
        }
    });

    // 2. Ao sair do campo (Tab ou Click fora), POPULA as opções.
    valorLuzInput.addEventListener("change", (e) => {
        const valor = parseFloat(e.target.value);
        if (valor >= VALOR_MINIMO) {
             popularOpcoesDeDesconto(valor);
             selectDesconto.focus();
        } else {
             opcoesDescontoDiv.style.display = 'none';
             selectOptionsShown = false;
        }
        resultadoCalculoDiv.style.display = 'none';
    });

    // 3. CORREÇÃO FINAL PARA O PRIMEIRO ENTER: Intercepta o Enter no Input
    valorLuzInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            const valor = parseFloat(valorLuzInput.value);
            
            // PRIMEIRO ENTER: Intercepta para exibir o select
            if (!selectOptionsShown && valor >= VALOR_MINIMO) {
                event.preventDefault(); // CRUCIAL: Impede o submit/recarregamento
                popularOpcoesDeDesconto(valor);
                selectDesconto.focus();
            }
        }
    });

    // 4. Evento para o envio do formulário (Botão ou 2º Enter)
    cotacaoForm.addEventListener("submit", (event) => {
        event.preventDefault(); 
        
        const valor = parseFloat(valorLuzInput.value);
        
        if (valor < VALOR_MINIMO || isNaN(valor)) {
            alert(`Para cotação, o valor da conta deve ser no mínimo R$${VALOR_MINIMO}.`);
            return;
        }

        // Se a flag for falsa, significa que o usuário usou o clique no botão (em vez do Enter)
        // E o formulário precisa passar pela primeira etapa.
        if (!selectOptionsShown) {
            popularOpcoesDeDesconto(valor); 
            selectDesconto.focus(); 
            return; 
        } 
        
        // Se a flag for verdadeira, CALCULA. (2º Enter ou clique final)
        calcularEconomia();
    });

    // 5. Redirecionamento para contato
    btnContato.addEventListener("click", () => {
        window.location.href = "https://wa.me/message/4BXMIP4XJNK4M1";
    });
});