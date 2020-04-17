window.userScope = {
    _dotnetHelper: Object,

    init: function(dotnetHelper) {
        userScope._dotnetHelper = dotnetHelper
    },

    nextStepActionByDirection: function (key, direction) {
        console.debug('NextStepActionByDirection(' + key + ', ' + direction + ') started');
        const startedDate = Date.now();

        userScope._dotnetHelper.invokeMethodAsync("NextStepActionByDirection", key, direction).
            then(function() {
                const timeSpan = Date.now() - startedDate;
            console.debug('NextStepActionByDirection(' + key + ', ' + direction + ') finished in ' + timeSpan + 'ms');
            });
    }
};