module.exports = function (activity, callback) {

    function CookiesToString(cookies) {
        var t = "";
        for (var x = 0; x < cookies.length; x++) {
            t += ((t !== "") ? "; " : "") + cookies[x].key + "=" + cookies[x].value;
        }
        return t;
    }

    var options = {
        hostname: 'httpbin.org',
        path: '/ip',
        method: 'GET',
        headers: {
            Cookie: CookiesToString(activity.Context.Cookies)
        }
    };

    var req = require("http").request(options, function (res) {
        res.setEncoding('utf8');
    });

    req.on('response', function (response) {

        // -- reject invalid status code --
        if (response.statusCode != "200") {

            activity.Response.ErrorCode = 500;
            activity.Response.Data = {
                ErrorText: "server returned status code " + response.statusCode
            };

            callback(null, activity);
            return;
        }

        var data = "";

        response.on('data', function (chunk) {
            data += chunk;
        });

        response.on('end', function () {

            // -- process response --
            try {
                var cookies = [];
                data = JSON.parse(data);

                // -- add here any code to convert/process received data

                activity.Response.Data = data;

                callback(null, activity);

            } catch (ex) {
                
                activity.Response.ErrorCode = 500;
                activity.Response.Data = {
                    ErrorText: ex && ex.message ? ex.message : "unknown error"
                };

                callback(null, activity);
            }

        });

    });


    req.on('error', function (e) {

        activity.Response.ErrorCode = 500;
        activity.Response.Data = {
            ErrorText: e.message
        };

        console.log('problem with request: ' + e.message);

        callback(null, activity);
    });

    req.end();

};
