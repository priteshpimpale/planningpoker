module.exports = {
    addRoutes: function(app,MongoClient, mongodbUrl){
        /********** modify urls as required ****************** */
        //// all secured request must be inside session 
        app.get("/api/offers", function (req, res) {
            /**Lists all documents in the db */
            sess = req.session;
            // check if session exists
            if (sess.user) {
                
            } else {
                res.send({ "result": "Session Timed out" });
            }
        });

        app.post("/api/offer", function (req, res) {
            sess = req.session;
            // check if session exists
            if (sess.user) {

            } else {
                res.send({ "result": "Session Timed out" });
            }
        });

        app.patch("/api/offer", function (req, res) {
            sess = req.session;
            // check if session exists
            if (sess.user) {

            } else {
                res.send({ "result": "Session Timed out" });
            }
        });

    }
}