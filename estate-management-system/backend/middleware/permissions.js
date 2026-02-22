const checkRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (req.user.role !== requiredRole) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }

        next();
    };
};

const checkAgentOwnership = async (req, res, next, getAgentId) => {
    const user = req.user;

    if (user.role === 'SUPER_ADMIN') {
        return next();
    }

    const agentId = getAgentId(req);

    if (user.agentId !== agentId) {
        return res.status(403).json({ message: 'Cannot access other agents\' data' });
    }

    next();
};

module.exports = { checkRole, checkAgentOwnership };
