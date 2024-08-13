const login = async (req, res) => {
    try {
        if (!username || !email || !password) {
            return res.status(400).json({
                message: 'Username, email, and password are required.',
            });
        }
        const { username, password } = req.body;
        const user = await modelUser.findOne({ username, password });
        if (user) {
            const token = JWT.sign({ id: user._id }, SECRET_KEY, {
                expiresIn: '1h',
            });
            const refreshToken = JWT.sign({ id: user._id }, SECRET_KEY, {
                expiresIn: '1d',
            });
            res.json({
                status: 200,
                message: 'Đăng nhập thành công',
                token: token,
                refreshToken: refreshToken,
            });
        } else {
            res.status(401).json({
                message: 'Invalid username or password',
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'An error occurred',
            error: error.message,
        });
    }
};

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({
                message: 'Username, email, and password are required.',
            });
        }
        const existingUser = await modelUser.findOne({
            $or: [{ email: email }, { username: username }],
        });
        if (existingUser) {
            return res.status(400).json({
                message: 'Email or username already exists.',
            });
        }
        const newUser = new modelUser(req.body);
        const result = await newUser.save();
        res.json({
            status: 200,
            message: 'User registered successfully',
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message,
        });
    }
};

module.exports = { login, register };
