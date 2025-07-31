// storage.js - Gerencia o armazenamento local dos dados financeiros

/**
 * Obtém todos os dados financeiros do localStorage
 * @returns {Object} Dados financeiros completos
 */
function getFinancialData() {
    const defaultData = {
        users: {
            user1: { name: "Lucas", income: 0, expenses: 0 },
            user2: { name: "Cecília", income: 0, expenses: 0 }
        },
        transactions: [],
        categories: [
            { id: 1, name: "Moradia", type: "expense", subcategories: ["Aluguel", "Condomínio", "Contas"] },
            { id: 2, name: "Alimentação", type: "expense", subcategories: ["Supermercado", "Restaurante"] },
            { id: 3, name: "Transporte", type: "expense", subcategories: ["Combustível", "Manutenção"] },
            { id: 4, name: "Lazer", type: "expense", subcategories: ["Viagens", "Hobbies"] },
            { id: 5, name: "Salário", type: "income", subcategories: ["Principal", "Bônus"] }
        ],
        budget: {},
        goals: [
            { id: 1, name: "Fundo de Emergência", target: 20000, current: 5000 }
        ],
        debts: []
    };

    const savedData = localStorage.getItem('financialData');
    return savedData ? JSON.parse(savedData) : defaultData;
}

/**
 * Salva todos os dados financeiros no localStorage
 * @param {Object} data - Dados financeiros completos
 */
function saveFinancialData(data) {
    localStorage.setItem('financialData', JSON.stringify(data));
}

/**
 * Adiciona uma nova transação
 * @param {Object} transaction - Objeto de transação
 */
function addTransaction(transaction) {
    const data = getFinancialData();
    
    // Atribui um ID único
    transaction.id = Date.now();
    transaction.date = new Date(transaction.date).toISOString();
    
    data.transactions.push(transaction);
    
    // Atualiza totais do usuário
    updateUserTotals(data, transaction);
    
    saveFinancialData(data);
    return data;
}

/**
 * Atualiza os totais de receita/despesa por usuário
 * @param {Object} data - Dados financeiros
 * @param {Object} transaction - Transação a ser processada
 */
function updateUserTotals(data, transaction) {
    const amount = parseFloat(transaction.amount);
    const userKey = transaction.responsible === 'user1' ? 'user1' : 'user2';

    if (transaction.type === 'income') {
        if (transaction.responsible === 'both') {
            data.users.user1.income += amount / 2;
            data.users.user2.income += amount / 2;
        } else {
            data.users[userKey].income += amount;
        }
    } else {
        if (transaction.responsible === 'both') {
            data.users.user1.expenses += amount / 2;
            data.users.user2.expenses += amount / 2;
        } else {
            data.users[userKey].expenses += amount;
        }
    }
}

/**
 * Obtém transações filtradas por mês/ano
 * @param {number} month - Mês (1-12)
 * @param {number} year - Ano (ex: 2025)
 * @returns {Array} Transações filtradas
 */
function getTransactionsByMonth(month, year) {
    const data = getFinancialData();
    return data.transactions.filter(transaction => {
        const date = new Date(transaction.date);
        return date.getMonth() + 1 === month && date.getFullYear() === year;
    });
}

/**
 * Adiciona valor a uma meta financeira
 * @param {number} goalId - ID da meta
 * @param {number} amount - Valor a ser adicionado
 */
function addToGoal(goalId, amount) {
    const data = getFinancialData();
    const goal = data.goals.find(g => g.id === goalId);
    
    if (goal) {
        goal.current = Math.min(goal.current + amount, goal.target);
        saveFinancialData(data);
    }
    
    return data;
}

/**
 * Obtém categorias por tipo (receita/despesa)
 * @param {string} type - 'income' ou 'expense'
 * @returns {Array} Categorias filtradas
 */
function getCategoriesByType(type) {
    const data = getFinancialData();
    return data.categories.filter(cat => cat.type === type);
}

// Interface pública
export const storage = {
    getFinancialData,
    saveFinancialData,
    addTransaction,
    getTransactionsByMonth,
    addToGoal,
    getCategoriesByType
};