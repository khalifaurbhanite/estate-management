// API Helper Class
class API {
    static async request(method, endpoint, data = null) {
        const token = localStorage.getItem('token');
        
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`/api${endpoint}`, options);

            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login.html';
                throw new Error('Unauthorized');
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'API Error');
            }

            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth Endpoints
    static login(email, password) {
        return this.request('POST', '/auth/login', { email, password });
    }

    static acceptTerms(userId, data) {
        return this.request('POST', '/auth/accept-terms', { userId, ...data });
    }

    static checkTermsAcceptance(userId) {
        return this.request('GET', `/auth/check-terms/${userId}`);
    }

    static resetPassword(userId, newPassword) {
        return this.request('POST', '/auth/reset-password', { userId, newPassword });
    }

    // Admin Endpoints
    static getAdminDashboard() {
        return this.request('GET', '/admin/dashboard');
    }

    static getAgents() {
        return this.request('GET', '/admin/agents');
    }

    static getAgentDetails(agentId) {
        return this.request('GET', `/admin/agents/${agentId}`);
    }

    static suspendAgent(agentId, reason) {
        return this.request('POST', `/admin/agents/${agentId}/suspend`, { reason });
    }

    static activateAgent(agentId) {
        return this.request('POST', `/admin/agents/${agentId}/activate`);
    }

    static getSystemReports() {
        return this.request('GET', '/admin/reports');
    }

    // Agent Endpoints
    static getAgentDashboard() {
        return this.request('GET', '/agent/dashboard');
    }

    static createEstate(data) {
        return this.request('POST', '/agent/estates', data);
    }

    static getEstates() {
        return this.request('GET', '/agent/estates');
    }

    static getEstateDetails(estateId) {
        return this.request('GET', `/agent/estates/${estateId}`);
    }

    static updateEstate(estateId, data) {
        return this.request('PUT', `/agent/estates/${estateId}`, data);
    }

    static deleteEstate(estateId) {
        return this.request('DELETE', `/agent/estates/${estateId}`);
    }

    static createCourt(data) {
        return this.request('POST', '/agent/courts', data);
    }

    static getCourts() {
        return this.request('GET', '/agent/courts');
    }

    static getCourtDetails(courtId) {
        return this.request('GET', `/agent/courts/${courtId}`);
    }

    static createBlock(data) {
        return this.request('POST', '/agent/blocks', data);
    }

    static getBlocks() {
        return this.request('GET', '/agent/blocks');
    }

    static getBlockDetails(blockId) {
        return this.request('GET', `/agent/blocks/${blockId}`);
    }

    static createHouse(data) {
        return this.request('POST', '/agent/houses', data);
    }

    static getHouses() {
        return this.request('GET', '/agent/houses');
    }

    static getHouseDetails(houseId) {
        return this.request('GET', `/agent/houses/${houseId}`);
    }

    static updateHouse(houseId, data) {
        return this.request('PUT', `/agent/houses/${houseId}`, data);
    }

    static addTenant(houseId, data) {
        return this.request('POST', `/agent/houses/${houseId}/tenant`, data);
    }

    static createEmployee(data) {
        return this.request('POST', '/agent/employees', data);
    }

    static getEmployees() {
        return this.request('GET', '/agent/employees');
    }

    static getEmployeeDetails(employeeId) {
        return this.request('GET', `/agent/employees/${employeeId}`);
    }

    static updateEmployee(employeeId, data) {
        return this.request('PUT', `/agent/employees/${employeeId}`, data);
    }

    static deactivateEmployee(employeeId) {
        return this.request('POST', `/agent/employees/${employeeId}/deactivate`);
    }

    // Billing Endpoints
    static generateMonthlyBills() {
        return this.request('POST', '/agent/generate-bills');
    }

    static getBills() {
        return this.request('GET', '/agent/bills');
    }

    static getBillDetails(billId) {
        return this.request('GET', `/agent/bills/${billId}`);
    }

    static recordPayment(billId, data) {
        return this.request('POST', `/agent/bills/${billId}/payment`, data);
    }

    static getOutstandingBills() {
        return this.request('GET', '/agent/outstanding-bills');
    }

    static getPaymentHistory(houseId) {
        return this.request('GET', `/agent/houses/${houseId}/payments`);
    }

    // Reminder Endpoints
    static getReminders() {
        return this.request('GET', '/agent/reminders');
    }

    static acknowledgeReminder(reminderId) {
        return this.request('POST', `/agent/reminders/${reminderId}/acknowledge`);
    }

    static getNotifications() {
        return this.request('GET', '/agent/notifications');
    }

    static markNotificationAsRead(notificationId) {
        return this.request('POST', `/agent/notifications/${notificationId}/read`);
    }

    // Report Endpoints
    static getAgentReports() {
        return this.request('GET', '/agent/reports');
    }

    static generateReport(type, filters) {
        return this.request('POST', '/agent/generate-report', { type, filters });
    }

    static exportData() {
        return this.request('GET', '/agent/export-data');
    }

    // Employee Endpoints
    static getEmployeeDashboard() {
        return this.request('GET', '/employee/dashboard');
    }

    static getAssignedHouses() {
        return this.request('GET', '/employee/houses');
    }

    static getAssignedHouseDetails(houseId) {
        return this.request('GET', `/employee/houses/${houseId}`);
    }

    static getAssignedBills() {
        return this.request('GET', '/employee/bills');
    }

    static getAssignedTasks() {
        return this.request('GET', '/employee/tasks');
    }

    static completeTask(taskId) {
        return this.request('POST', `/employee/tasks/${taskId}/complete`);
    }

    static recordRent(houseId, data) {
        return this.request('POST', `/employee/houses/${houseId}/record-rent`, data);
    }

    static updateTenant(tenantId, data) {
        return this.request('PUT', `/employee/tenants/${tenantId}`, data);
    }

    static logMaintenance(houseId, data) {
        return this.request('POST', `/employee/houses/${houseId}/maintenance`, data);
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}
