const authController = require('./controllers/auth.controller');
const { protectedRoute, checkRole } = require('./middlewares/auth.middleware');
const upload = require('./middlewares/multer.middleware');

module.exports = function(app){
    app.get('/', (req, res) => {
        res.status(200).json({msg: 'Hello World!',})
    })

    app.post('/auth/register', authController.register)
    app.post('/auth/login', authController.login)
    app.post('/auth/logout', authController.logout)
    app.get('/auth/check', protectedRoute, authController.checkAuth)
    app.put('/auth/update-profile-pic', protectedRoute, checkRole(['Admin']), upload.single('profilePic'), authController.updateProfilePic)
    app.post('/auth/update-profile', protectedRoute, checkRole(['Admin']), authController.updateProfile)
}