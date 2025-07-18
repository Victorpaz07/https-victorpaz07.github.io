document.addEventListener('DOMContentLoaded', () => {
    const calculateBtn = document.getElementById('calculate');
    const resultSection = document.getElementById('resultSection');
    const gaugeFill = document.getElementById('gaugeFill');
    const gaugeValue = document.getElementById('gaugeValue');
    const recommendations = document.getElementById('recommendations');

    // Configuração das atividades e seus valores em Mbps
    const activities = {
        social: { value: 5, name: 'Redes sociais' },
        streaming: { value: 15, name: 'Streaming de Vídeo HD+' },
        gaming: { value: 20, name: 'Jogos Online Multiplayer' },
        music: { value: 7, name: 'Streaming de Música' }
    };

    // Variável para armazenar o número de pessoas
    let numberOfPeople = 1;

    // Elementos do seletor de pessoas
    const peopleSelectorBtn = document.querySelector('.people-selector-btn');
    const peopleSelectorDropdown = document.querySelector('.people-selector-dropdown');
    const peopleCount = document.querySelector('.people-count');
    const peopleLabel = document.querySelector('.people-label');
    const peopleOptions = document.querySelectorAll('.people-option');

    // Função para atualizar o texto do botão
    function updatePeopleButton(count) {
        peopleCount.textContent = count;
        peopleLabel.textContent = count === 1 ? 'pessoa' : 'pessoas';
    }

    // Função para atualizar o contador com animação
    function updateCounter(button, increment) {
        const counterDiv = button.closest('.device-counter');
        const countSpan = counterDiv.querySelector('.count');
        let count = parseInt(countSpan.textContent);
        
        if (increment) {
            count++;
        } else {
            count = Math.max(0, count - 1);
        }
        
        // Adiciona animação ao número
        countSpan.style.transform = 'scale(1.2)';
        setTimeout(() => {
            countSpan.style.transform = 'scale(1)';
        }, 200);
        
        countSpan.textContent = count;
        calculateTotalSpeed();
    }

    // Adiciona eventos aos botões de contador com feedback tátil
    document.querySelectorAll('.counter-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const isPlus = e.target.classList.contains('plus');
            updateCounter(e.target, isPlus);
            
            // Feedback visual
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 100);
        });
    });

    // Eventos do seletor de pessoas
    peopleSelectorBtn.addEventListener('click', () => {
        peopleSelectorDropdown.classList.toggle('active');
    });

    // Fechar dropdown ao clicar fora
    document.addEventListener('click', (e) => {
        if (!peopleSelectorBtn.contains(e.target) && !peopleSelectorDropdown.contains(e.target)) {
            peopleSelectorDropdown.classList.remove('active');
        }
    });

    // Selecionar número de pessoas com animação
    peopleOptions.forEach(option => {
        option.addEventListener('click', () => {
            const value = parseInt(option.dataset.value);
            numberOfPeople = value;
            updatePeopleButton(value);
            
            // Atualizar seleção visual com animação
            peopleOptions.forEach(opt => {
                opt.classList.remove('selected');
                opt.style.transform = 'scale(1)';
            });
            option.classList.add('selected');
            option.style.transform = 'scale(1.05)';
            setTimeout(() => {
                option.style.transform = 'scale(1)';
            }, 200);
            
            // Fechar dropdown com animação
            peopleSelectorDropdown.classList.remove('active');
            
            // Recalcular velocidade
            calculateTotalSpeed();
        });
    });

    // Função para calcular a velocidade total com animação
    function calculateTotalSpeed() {
        let totalSpeed = 0;
        let breakdown = {};

        // Calcula a velocidade para cada atividade
        document.querySelectorAll('.activity-card').forEach(card => {
            const type = Array.from(card.querySelector('.card-icon').classList)
                .find(cls => Object.keys(activities).includes(cls));
            const count = parseInt(card.querySelector('.count').textContent);
            
            if (count > 0) {
                const speed = activities[type].value * count;
                totalSpeed += speed;
                breakdown[type] = speed;
            }
        });

        // Aplica o multiplicador de pessoas
        totalSpeed *= numberOfPeople;

        // Atualiza o valor total com animação
        const speedValue = document.querySelector('.speed-value');
        const currentValue = parseInt(speedValue.textContent);
        animateValue(speedValue, currentValue, totalSpeed, 500);

        // Atualiza as porcentagens no gráfico donut e breakdown
        if (totalSpeed > 0) {
            updateDonutChart(breakdown, totalSpeed);
            updateBreakdown(breakdown, totalSpeed);
        }
    }

    // Função para animar valores numéricos
    function animateValue(element, start, end, duration) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;

        const animate = () => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                element.textContent = end;
                return;
            }
            element.textContent = Math.round(current);
            requestAnimationFrame(animate);
        };

        animate();
    }

    // Função para atualizar o gráfico donut com animação
    function updateDonutChart(breakdown, total) {
        let currentPercentage = 0;
        let gradientString = '';

        Object.entries(breakdown).forEach(([type, speed]) => {
            const percentage = (speed / total) * 100;
            gradientString += `var(--${type}-color) ${currentPercentage}% ${currentPercentage + percentage}%, `;
            currentPercentage += percentage;
        });

        // Remove a última vírgula e espaço
        gradientString = gradientString.slice(0, -2);

        const donutChart = document.querySelector('.donut-chart');
        donutChart.style.transition = 'background 0.5s ease';
        donutChart.style.background = `conic-gradient(${gradientString})`;
    }

    // Função para atualizar o breakdown de velocidades com animação
    function updateBreakdown(breakdown, total) {
        Object.entries(breakdown).forEach(([type, speed]) => {
            const percentage = ((speed / total) * 100).toFixed(2);
            const text = `${percentage}% ou seja ${speed} megas com ${activities[type].name}`;
            
            const breakdownItem = document.querySelector(`.breakdown-item.${type} .text`);
            if (breakdownItem) {
                breakdownItem.style.transition = 'opacity 0.3s ease';
                breakdownItem.style.opacity = '0';
                setTimeout(() => {
                    breakdownItem.textContent = text;
                    breakdownItem.style.opacity = '1';
                }, 300);
            }
        });
    }

    // Função para calcular a velocidade total necessária
    function calculateSpeed() {
        const devices = parseInt(document.getElementById('devices').value) || 1;
        let totalSpeed = 0;
        let selectedActivities = [];

        // Soma as velocidades das atividades selecionadas
        Object.keys(activities).forEach(activity => {
            const checkbox = document.getElementById(activity);
            if (checkbox.checked) {
                totalSpeed += activities[activity].value;
                selectedActivities.push(activities[activity].name);
            }
        });

        // Multiplica pelo número de dispositivos
        totalSpeed *= devices;

        // Atualiza o medidor visual
        updateGauge(totalSpeed);

        // Gera recomendações
        generateRecommendations(totalSpeed, selectedActivities);

        // Mostra a seção de resultados
        resultSection.classList.add('active');
    }

    // Função para atualizar o medidor visual
    function updateGauge(speed) {
        // Limita a altura máxima do medidor a 100%
        const maxSpeed = 200; // Velocidade máxima considerada
        const percentage = Math.min((speed / maxSpeed) * 100, 100);
        
        gaugeFill.style.height = `${percentage}%`;
        gaugeValue.textContent = `${speed} Mbps`;
    }

    // Função para gerar recomendações
    function generateRecommendations(speed, selectedActivities) {
        let recommendationsHTML = '<h3>Recomendações:</h3>';
        
        // Recomendações baseadas na velocidade
        if (speed < 50) {
            recommendationsHTML += `
                <p>Para ${speed} Mbps, recomendamos:</p>
                <ul>
                    <li>Plano Básico (50 Mbps)</li>
                    <li>Ideal para ${selectedActivities.length > 0 ? selectedActivities.join(', ') : 'uso básico'}</li>
                </ul>
            `;
        } else if (speed < 100) {
            recommendationsHTML += `
                <p>Para ${speed} Mbps, recomendamos:</p>
                <ul>
                    <li>Plano Intermediário (100 Mbps)</li>
                    <li>Perfeito para ${selectedActivities.length > 0 ? selectedActivities.join(', ') : 'uso moderado'}</li>
                </ul>
            `;
        } else {
            recommendationsHTML += `
                <p>Para ${speed} Mbps, recomendamos:</p>
                <ul>
                    <li>Plano Premium (200 Mbps ou superior)</li>
                    <li>Ideal para ${selectedActivities.length > 0 ? selectedActivities.join(', ') : 'uso intensivo'}</li>
                </ul>
            `;
        }

        // Dicas de otimização
        recommendationsHTML += `
            <h3>Dicas de Otimização:</h3>
            <ul>
                <li>Use roteador de 5GHz para melhor performance</li>
                <li>Mantenha o roteador em local centralizado</li>
                <li>Evite interferências de outros dispositivos</li>
                <li>Considere usar cabo de rede para atividades críticas</li>
            </ul>
        `;

        recommendations.innerHTML = recommendationsHTML;
    }

    // Adiciona evento de clique ao botão de cálculo
    calculateBtn.addEventListener('click', calculateSpeed);

    // Adiciona validação para o input de dispositivos
    const devicesInput = document.getElementById('devices');
    devicesInput.addEventListener('input', (e) => {
        if (e.target.value < 1) e.target.value = 1;
    });

    // Calcula a velocidade inicial
    calculateTotalSpeed();
}); 