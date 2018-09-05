var AjaxResult = {
    Sucess: 'success',
    Fail: 'fail'
};

var AjaxJS = {
    simpleRequest: function(url, data, onSuccess) {
        $.ajax({
            type: 'POST',
            url: url,
            data: data
        }).done(function(result) {
            var jsonResult = {};
            try {
                jsonResult = JSON.parse(result);
            }
            catch (e) {
                console.error(e);
            }

            if (jsonResult.result == AjaxResult.Sucess) {
                onSuccess && onSuccess(jsonResult);
            }
        });
    }
};