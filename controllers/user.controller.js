async function get(req, res, next) {
    try {
        res.json({ status: "success", data: "DEMO ENDPOINT" });
    } catch (err) {
        console.error(`Error while getting user`, err.message);
        next(err);
    }
  }

  module.exports = {
    get
  };