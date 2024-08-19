const verify_code_register = async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({
                message: 'Email and code are required.',
            });
        }
    }
    catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message,
        });
    }
}

const verify_code_forgot_password = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: 'Email is required.',
            });
        }
    }
    catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message,
        });
    }
}

const verify_code_change_password = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: 'Email is required.',
            });
        }
    }
    catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message,
        });
    }
}

module.exports = {
    verify_code_register,
    verify_code_forgot_password,
    verify_code_change_password,
};