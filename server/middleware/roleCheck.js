
const roleCheck = isAdmin => (req, res, next) => {
    if (req.user && (req.user.isAdmin === isAdmin || req.user.id === req.params.id)) {

        next();
    } else {
        res.status(401);
        throw new Error('Not authorized');
    }
}

module.exports = roleCheck;