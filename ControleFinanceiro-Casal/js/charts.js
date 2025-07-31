// charts.js - Configuração dos gráficos do dashboard
let incomeExpenseChart;
let expenseDistributionChart;
let categorySpendingChart;
let goalsProgressChart;

// Inicializa todos os gráficos
function initCharts(data) {
    createIncomeExpenseChart(data);
    createExpenseDistributionChart(data);
    createCategorySpendingChart(data);
    createGoalsProgressChart(data);
}

// Atualiza todos os gráficos com novos dados
function updateCharts(data) {
    updateIncomeExpenseChart(data);
    updateExpenseDistributionChart(data);
    updateCategorySpendingChart(data);
    updateGoalsProgressChart(data);
}

// Gráfico de Receitas vs Despesas
function createIncomeExpenseChart(data) {
    const ctx = document.getElementById('incomeExpenseChart').getContext('2d');
    incomeExpenseChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Receitas', 'Despesas'],
            datasets: [{
                label: 'Valor (R$)',
                data: [
                    data.users.user1.income + data.users.user2.income,
                    data.users.user1.expenses + data.users.user2.expenses
                ],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(255, 99, 132, 0.7)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: getDefaultChartOptions('Valor (R$)')
    });
}

// Gráfico de Distribuição de Gastos
function createExpenseDistributionChart(data) {
    const ctx = document.getElementById('expenseDistributionChart').getContext('2d');
    expenseDistributionChart = new Chart(ctx, {
        type: 'pie',
        data: getExpenseDistributionData(data),
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'right' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatChartTooltip(context);
                        }
                    }
                }
            }
        }
    });
}

// Gráfico de Gastos por Categoria
function createCategorySpendingChart(data) {
    const ctx = document.getElementById('categorySpendingChart').getContext('2d');
    categorySpendingChart = new Chart(ctx, {
        type: 'doughnut',
        data: getCategorySpendingData(data),
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'right' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatChartTooltip(context);
                        }
                    }
                }
            }
        }
    });
}

// Gráfico de Progresso de Metas
function createGoalsProgressChart(data) {
    const ctx = document.getElementById('goalsProgressChart').getContext('2d');
    goalsProgressChart = new Chart(ctx, {
        type: 'bar',
        data: getGoalsProgressData(data),
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const target = context.dataset.targets[context.dataIndex];
                            return `${context.parsed.x.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (${Math.round((context.parsed.x / target) * 100)}%)`;
                        }
                    }
                }
            },
            scales: {
                x: { stacked: true, ticks: { callback: currencyFormatter } },
                y: { stacked: true }
            }
        }
    });
}

// Funções auxiliares para dados dos gráficos
function getExpenseDistributionData(data) {
    const user1Expenses = data.users.user1.expenses;
    const user2Expenses = data.users.user2.expenses;
    const sharedExpenses = (user1Expenses + user2Expenses) * 0.1; // 10% como compartilhado

    return {
        labels: [data.users.user1.name, data.users.user2.name, 'Compartilhado'],
        datasets: [{
            data: [user1Expenses, user2Expenses, sharedExpenses],
            backgroundColor: [
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 99, 132, 0.7)',
                'rgba(255, 206, 86, 0.7)'
            ],
            borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(255, 206, 86, 1)'
            ],
            borderWidth: 1
        }]
    };
}

function getCategorySpendingData(data) {
    const categories = {};
    
    data.transactions.forEach(transaction => {
        if (transaction.type === 'expense') {
            if (!categories[transaction.category]) {
                categories[transaction.category] = 0;
            }
            categories[transaction.category] += transaction.amount;
        }
    });
    
    return {
        labels: Object.keys(categories),
        datasets: [{
            data: Object.values(categories),
            backgroundColor: generateChartColors(Object.keys(categories).length),
            borderWidth: 1
        }]
    };
}

function getGoalsProgressData(data) {
    return {
        labels: data.goals.map(goal => goal.name),
        datasets: [
            {
                label: 'Concluído',
                data: data.goals.map(goal => goal.current),
                backgroundColor: 'rgba(75, 192, 192, 0.7)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            },
            {
                label: 'Restante',
                data: data.goals.map(goal => goal.target - goal.current),
                backgroundColor: 'rgba(255, 99, 132, 0.3)',
                borderColor: 'rgba(255, 99, 132, 0.5)',
                borderWidth: 1
            }
        ],
        targets: data.goals.map(goal => goal.target)
    };
}

// Funções de atualização
function updateIncomeExpenseChart(data) {
    incomeExpenseChart.data.datasets[0].data = [
        data.users.user1.income + data.users.user2.income,
        data.users.user1.expenses + data.users.user2.expenses
    ];
    incomeExpenseChart.update();
}

function updateExpenseDistributionChart(data) {
    expenseDistributionChart.data = getExpenseDistributionData(data);
    expenseDistributionChart.update();
}

function updateCategorySpendingChart(data) {
    categorySpendingChart.data = getCategorySpendingData(data);
    categorySpendingChart.update();
}

function updateGoalsProgressChart(data) {
    goalsProgressChart.data = getGoalsProgressData(data);
    goalsProgressChart.update();
}

// Utilitários
function getDefaultChartOptions(title) {
    return {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return context.parsed.y.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { callback: currencyFormatter }
            }
        }
    };
}

function currencyFormatter(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatChartTooltip(context) {
    const label = context.label || '';
    const value = context.raw || 0;
    const total = context.dataset.data.reduce((a, b) => a + b, 0);
    const percentage = Math.round((value / total) * 100);
    return `${label}: ${value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (${percentage}%)`;
}

function generateChartColors(count) {
    const colors = [];
    const hueStep = 360 / count;
    
    for (let i = 0; i < count; i++) {
        colors.push(`hsla(${i * hueStep}, 70%, 60%, 0.7)`);
    }
    
    return colors;
}