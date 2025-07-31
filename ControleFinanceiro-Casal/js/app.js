document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
});

function initApp() {
    // Initialize storage
    if (!localStorage.getItem('financialData')) {
        setupInitialData();
    }
    
    // Load data
    const financialData = JSON.parse(localStorage.getItem('financialData'));
    
    // Set up event listeners
    setupEventListeners();
    
    // Update UI
    updateDashboard(financialData);
    populateMonthSelect();
    populateCategorySelect();
    
    // Initialize charts
    initCharts(financialData);
}

function setupInitialData() {
    const initialData = {
        users: {
            user1: {
                name: "Lucas",
                income: 0,
                expenses: 0
            },
            user2: {
                name: "Cecília",
                income: 0,
                expenses: 0
            }
        },
        transactions: [],
        categories: [
            { id: 1, name: "Moradia", type: "expense", subcategories: ["Aluguel", "Condomínio", "Energia", "Água", "Internet"] },
            { id: 2, name: "Alimentação", type: "expense", subcategories: ["Supermercado", "Restaurante", "Lanches"] },
            { id: 3, name: "Transporte", type: "expense", subcategories: ["Combustível", "Estacionamento", "Manutenção", "Ônibus/Uber"] },
            { id: 4, name: "Saúde", type: "expense", subcategories: ["Plano de Saúde", "Médico", "Remédios", "Academia"] },
            { id: 5, name: "Lazer", type: "expense", subcategories: ["Cinema", "Viagens", "Hobbies"] },
            { id: 6, name: "Educação", type: "expense", subcategories: ["Cursos", "Livros", "Faculdade"] },
            { id: 7, name: "Salário", type: "income", subcategories: ["Principal", "Bônus", "Freelance"] },
            { id: 8, name: "Investimentos", type: "income", subcategories: ["Dividendos", "Rendimentos"] }
        ],
        budget: {},
        goals: [
            { id: 1, name: "Fundo de Emergência", target: 20000, current: 5000, monthlyContribution: 1000 },
            { id: 2, name: "Viagem Europa", target: 15000, current: 3000, monthlyContribution: 800 }
        ],
        debts: [
            { id: 1, name: "Dívida Sofia", total: 3158, paid: 0, remaining: 3158, interest: 5, dueDate: "2024-12-31" }
        ]
    };
    
    localStorage.setItem('financialData', JSON.stringify(initialData));
}

function setupEventListeners() {
    // Add transaction button
    document.getElementById('add-transaction-btn').addEventListener('click', function() {
        const transactionModal = new bootstrap.Modal(document.getElementById('transactionModal'));
        transactionModal.show();
    });
    
    // Save transaction button
    document.getElementById('save-transaction').addEventListener('click', saveTransaction);
    
    // Month select change
    document.getElementById('month-select').addEventListener('change', function() {
        const month = this.value;
        filterDataByMonth(month);
    });
}

function saveTransaction() {
    // Get form values
    const type = document.getElementById('transaction-type').value;
    const date = document.getElementById('transaction-date').value;
    const description = document.getElementById('transaction-description').value;
    const category = document.getElementById('transaction-category').value;
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const payment = document.getElementById('transaction-payment').value;
    const responsible = document.getElementById('transaction-responsible').value;
    const notes = document.getElementById('transaction-notes').value;
    
    // Validate
    if (!type || !date || !description || !category || !amount || !payment || !responsible) {
        alert("Por favor, preencha todos os campos obrigatórios!");
        return;
    }
    
    // Create transaction object
    const transaction = {
        id: Date.now(),
        type,
        date,
        description,
        category,
        amount,
        payment,
        responsible,
        notes,
        status: "completed"
    };
    
    // Save to storage
    const financialData = JSON.parse(localStorage.getItem('financialData'));
    financialData.transactions.push(transaction);
    
    // Update user totals
    if (type === "income") {
        if (responsible === "user1") financialData.users.user1.income += amount;
        else if (responsible === "user2") financialData.users.user2.income += amount;
        else {
            financialData.users.user1.income += amount / 2;
            financialData.users.user2.income += amount / 2;
        }
    } else {
        if (responsible === "user1") financialData.users.user1.expenses += amount;
        else if (responsible === "user2") financialData.users.user2.expenses += amount;
        else {
            financialData.users.user1.expenses += amount / 2;
            financialData.users.user2.expenses += amount / 2;
        }
    }
    
    localStorage.setItem('financialData', JSON.stringify(financialData));
    
    // Update UI
    updateDashboard(financialData);
    updateRecentTransactions(financialData.transactions);
    updateCharts(financialData);
    
    // Close modal
    const transactionModal = bootstrap.Modal.getInstance(document.getElementById('transactionModal'));
    transactionModal.hide();
    
    // Reset form
    document.getElementById('transaction-form').reset();
}

function updateDashboard(data) {
    // Calculate totals
    const totalIncome = data.users.user1.income + data.users.user2.income;
    const totalExpenses = data.users.user1.expenses + data.users.user2.expenses;
    const totalBalance = totalIncome - totalExpenses;
    const savingsProgress = (data.goals[0].current / data.goals[0].target * 100).toFixed(1);
    
    // Update summary cards
    document.getElementById('total-income').textContent = formatCurrency(totalIncome);
    document.getElementById('total-expenses').textContent = formatCurrency(totalExpenses);
    document.getElementById('total-balance').textContent = formatCurrency(totalBalance);
    document.getElementById('total-savings').textContent = formatCurrency(data.goals[0].current);
    document.getElementById('savings-progress').textContent = `${savingsProgress}%`;
    
    // Update recent transactions
    updateRecentTransactions(data.transactions);
}

function updateRecentTransactions(transactions) {
    const tbody = document.getElementById('recent-transactions');
    tbody.innerHTML = '';
    
    // Sort by date (newest first)
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Show last 5 transactions
    const recent = sortedTransactions.slice(0, 5);
    
    recent.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(transaction.date)}</td>
            <td>${transaction.description}</td>
            <td>${transaction.category}</td>
            <td class="${transaction.type === 'income' ? 'text-success' : 'text-danger'}">
                ${transaction.type === 'income' ? '+' : '-'} ${formatCurrency(transaction.amount)}
            </td>
            <td>${getResponsibleName(transaction.responsible)}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function populateMonthSelect() {
    const select = document.getElementById('month-select');
    
    // Add months
    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = month;
        select.appendChild(option);
    });
}

function populateCategorySelect() {
    const select = document.getElementById('transaction-category');
    const financialData = JSON.parse(localStorage.getItem('financialData'));
    
    financialData.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        select.appendChild(option);
    });
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(dateString) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

function getResponsibleName(responsible) {
    const financialData = JSON.parse(localStorage.getItem('financialData'));
    
    switch(responsible) {
        case 'user1': return financialData.users.user1.name;
        case 'user2': return financialData.users.user2.name;
        case 'both': return 'Ambos';
        default: return '';
    }
}

function filterDataByMonth(month) {
    const financialData = JSON.parse(localStorage.getItem('financialData'));
    
    if (month === "0") {
        updateDashboard(financialData);
        updateCharts(financialData);
        return;
    }
    
    // Filter transactions by month
    const filteredTransactions = financialData.transactions.filter(transaction => {
        const transactionMonth = new Date(transaction.date).getMonth() + 1;
        return transactionMonth == month;
    });
    
    // Calculate filtered totals
    let filteredIncome = 0;
    let filteredExpenses = 0;
    
    filteredTransactions.forEach(transaction => {
        if (transaction.type === 'income') {
            if (transaction.responsible === 'user1') filteredIncome += transaction.amount;
            else if (transaction.responsible === 'user2') filteredIncome += transaction.amount;
            else filteredIncome += transaction.amount;
        } else {
            if (transaction.responsible === 'user1') filteredExpenses += transaction.amount;
            else if (transaction.responsible === 'user2') filteredExpenses += transaction.amount;
            else filteredExpenses += transaction.amount;
        }
    });
    
    // Create filtered data object
    const filteredData = {
        ...financialData,
        transactions: filteredTransactions,
        users: {
            user1: {
                ...financialData.users.user1,
                income: filteredIncome / 2,
                expenses: filteredExpenses / 2
            },
            user2: {
                ...financialData.users.user2,
                income: filteredIncome / 2,
                expenses: filteredExpenses / 2
            }
        }
    };
    
    // Update UI with filtered data
    updateDashboard(filteredData);
    updateCharts(filteredData);
}