async function getUser(req, res, next) {
    try {
        res.json({status: "success", data: {userId: "demo"}});
    } catch (err) {
        console.error(`Error while getting user`, err.message);
        next(err);
    }
}

module.exports = {
    getUser
};